'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function uploadImage(file: { name: string, type: string, buffer: ArrayBuffer }, bucket: 'products' | 'brands' | 'invoices' | 'collections' | 'categories') {
  try {
    const supabase = createAdminClient();
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error(`Upload error for bucket ${bucket}:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Storage action error:', error);
    throw error;
  }
}

export async function deleteImage(url: string, bucket: 'products' | 'brands' | 'invoices' | 'collections' | 'categories') {
  const supabase = createAdminClient();
  
  // Extract filename from URL
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  
  const { error } = await supabase.storage.from(bucket).remove([fileName]);
  
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
