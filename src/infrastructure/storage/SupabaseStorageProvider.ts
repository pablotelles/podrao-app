import type { IStorageProvider } from '@/domain/interfaces/IStorageProvider';
import { supabase } from '@/infrastructure/database/supabase/client';

const BUCKET = 'place-photos';

export class SupabaseStorageProvider implements IStorageProvider {
  async upload(path: string, file: File | Blob): Promise<string> {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file instanceof File ? file.type : 'image/jpeg',
    });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(error.message);
  }
}
