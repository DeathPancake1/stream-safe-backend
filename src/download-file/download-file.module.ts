import { Module } from '@nestjs/common';
import { DownloadFileController } from './download-file.controller';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DownloadFileService } from './download-file.service';

@Module({
    controllers: [DownloadFileController],
    providers: [PrismaService,JwtService, DownloadFileService]
})
export class DownloadFileModule {}
