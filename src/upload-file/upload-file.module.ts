import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { UploadFileController } from './upload-file.controller';

@Module({
  providers: [UploadFileService],
  controllers: [UploadFileController]
})
export class UploadFileModule {}
