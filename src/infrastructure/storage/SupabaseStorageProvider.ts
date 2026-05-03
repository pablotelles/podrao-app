import type { IStorageProvider } from '@/domain/interfaces/IStorageProvider';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/infrastructure/database/supabase/client';

const BUCKET = 'place-photos';

export class SupabaseStorageProvider implements IStorageProvider {
  constructor(private readonly db: SupabaseClient = supabase) {}

  async upload(path: string, file: File | Blob): Promise<string> {
    const { error } = await this.db.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file instanceof File ? file.type : 'image/jpeg',
    });

    if (error) throw new Error(error.message);

    const { data } = this.db.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.db.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(error.message);
  }

  async deleteByUrl(url: string): Promise<void> {
    // Extrair path da URL pública
    // URL formato: https://[project].supabase.co/storage/v1/object/public/place-photos/places/[user_id]/[timestamp].jpg
    const match = url.match(/\/place-photos\/(.+)$/);
    if (!match) throw new Error('URL inválida para extração de path');

    const path = match[1];
    await this.delete(path);
  }
}
