import { Injectable, Inject } from '@nestjs/common';
import { MINIO_CLIENT } from './storage.constants';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly bucket: string;

  constructor(
    @Inject(MINIO_CLIENT) private readonly minio: Minio.Client,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'agrix-media');
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket);
    }
    // Always ensure public read policy
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${this.bucket}/*`],
      }],
    });
    await this.minio.setBucketPolicy(this.bucket, policy);
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<{ url: string; key: string }> {
    await this.ensureBucket();
    await this.minio.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': mimetype,
    });
    const url = this.getPublicUrl(key);
    return { url, key };
  }

  async deleteFile(key: string): Promise<void> {
    await this.minio.removeObject(this.bucket, key);
  }

  getPublicUrl(key: string): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<string>('MINIO_PORT', '9000');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucket}/${key}`;
  }
}
