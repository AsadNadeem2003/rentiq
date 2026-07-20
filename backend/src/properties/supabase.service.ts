import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing. File uploads will fail until added to .env');
    }

    this.supabase = createClient(
      supabaseUrl || 'http://placeholder',
      supabaseKey || 'placeholder',
      {
        auth: {
          persistSession: false,
        },
      },
    );
  }

  /**
   * Uploads a file to Supabase Storage and returns the public URL.
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;

    const { data, error } = await this.supabase.storage
      .from('properties')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new InternalServerErrorException('Failed to upload media file');
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('properties').getPublicUrl(fileName);

    return publicUrl;
  }
}
