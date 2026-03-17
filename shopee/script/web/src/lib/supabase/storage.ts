import { createBrowserSupabaseClient } from './browserClient';

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param folder - Folder path within bucket
 * @returns Object with url and error
 */
export async function uploadFile(
  file: File,
  bucket: string = 'products',
  folder: string = 'images'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createBrowserSupabaseClient();
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (err: any) {
    console.error('Upload exception:', err);
    return { url: null, error: err.message || 'Upload failed' };
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string = 'products',
  folder: string = 'images'
): Promise<{ url: string; fileName: string }[]> {
  const results = await Promise.all(
    files.map(async (file) => {
      const { url, error } = await uploadFile(file, bucket, folder);
      return { url: url || '', fileName: file.name, error };
    })
  );

  return results
    .filter((r) => r.url && !r.error)
    .map((r) => ({ url: r.url, fileName: r.fileName }));
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  filePath: string,
  bucket: string = 'products'
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createBrowserSupabaseClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  filePath: string,
  bucket: string = 'products'
): string {
  const supabase = createBrowserSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
