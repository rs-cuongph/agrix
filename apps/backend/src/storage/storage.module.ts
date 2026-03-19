import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export const MINIO_CLIENT = 'MINIO_CLIENT';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MINIO_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Minio.Client({
          endPoint: configService.get<string>('MINIO_ENDPOINT', 'localhost'),
          port: parseInt(configService.get<string>('MINIO_PORT', '9000')),
          useSSL: configService.get<string>('MINIO_USE_SSL') === 'true',
          accessKey: configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
          secretKey: configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
        });
      },
    },
  ],
  exports: [MINIO_CLIENT],
})
export class StorageModule {}
