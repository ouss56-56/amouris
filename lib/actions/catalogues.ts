'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getCataloguesAction() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('catalogues')
    .select('*');

  if (error) {
    console.error('Error fetching catalogues:', error);
    return [];
  }
  return data;
}

export async function uploadCatalogueAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'parfums' | 'flacons';

    if (!file || !type) {
      throw new Error('Missing file or type');
    }

    const supabase = createAdminClient();

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('catalogues')
      .upload(filePath, Buffer.from(await file.arrayBuffer()), {
        contentType: 'application/pdf',
        upsert: true
      });

    if (storageError) throw new Error(`Storage error: ${storageError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('catalogues')
      .getPublicUrl(filePath);

    // 2. Update Database
    const { data, error: dbError } = await supabase
      .from('catalogues')
      .upsert({
        type,
        filename: file.name,
        url: publicUrl,
        file_size_kb: Math.round(file.size / 1024),
        updated_at: new Date().toISOString()
      }, { onConflict: 'type' })
      .select()
      .single();

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    revalidatePath('/admin/catalogues');
    revalidatePath('/');
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Upload catalogue error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCatalogueAction(id: string) {
  try {
    const supabase = createAdminClient();
    
    // Get info first to delete from storage
    const { data: cat } = await supabase.from('catalogues').select('*').eq('id', id).single();
    if (cat) {
      const fileName = cat.url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('catalogues').remove([fileName]);
      }
    }

    const { error } = await supabase
      .from('catalogues')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/catalogues');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete catalogue error:', error);
    return { success: false, error: error.message };
  }
}
