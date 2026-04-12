'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function uploadImage(file: { name: string, type: string, buffer: ArrayBuffer }, bucket: 'products' | 'brands' | 'invoices' | 'collections') {
  const supabase = createAdminClient();
  
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.type,
      upsert: true
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  
  return publicUrl;
}

export async function deleteImage(url: string, bucket: 'products' | 'brands' | 'invoices' | 'collections') {
  const supabase = createAdminClient();
  
  // Extract filename from URL
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  
  const { error } = await supabase.storage.from(bucket).remove([fileName]);
  
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
