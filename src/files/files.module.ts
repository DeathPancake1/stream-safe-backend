import { Module } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
    controllers: [FilesController],
    providers: [FilesService, PrismaService, JwtService]
})
export class FilesModule {}
