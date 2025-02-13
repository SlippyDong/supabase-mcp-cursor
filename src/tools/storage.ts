import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const storageToolNames = {
  uploadFile: 'upload_file',
  downloadFile: 'download_file',
};

export const storageToolDescriptions = {
  uploadFile: 'Upload a file to Supabase Storage',
  downloadFile: 'Download a file from Supabase Storage',
};

const ResponseSchema = z.object({
  content: z.array(z.object({
    type: z.literal('text'),
    text: z.string(),
  })),
});

export const UploadFileSchema = z.object({
  bucket: z.string(),
  path: z.string(),
  file: z.any(),
  options: z.object({
    cacheControl: z.string().optional(),
    contentType: z.string().optional(),
    upsert: z.boolean().optional(),
  }).optional(),
});

export const DownloadFileSchema = z.object({
  bucket: z.string(),
  path: z.string(),
});

export const runUploadFileTool = async (supabase: SupabaseClient, args: z.infer<typeof UploadFileSchema>) => {
  const { bucket, path, file, options } = args;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) throw error;
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(data) }],
  });
};

export const runDownloadFileTool = async (supabase: SupabaseClient, args: z.infer<typeof DownloadFileSchema>) => {
  const { bucket, path } = args;
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(data) }],
  });
}; 