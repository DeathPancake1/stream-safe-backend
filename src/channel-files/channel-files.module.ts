import { Module } from '@nestjs/common';
import { ChannelFilesController } from './channel-files.controller';
import { ChannelFilesService } from './channel-files.service';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ChannelFilesController],
  providers: [ChannelFilesService, PrismaService, JwtService]
})
export class ChannelFilesModule {}
