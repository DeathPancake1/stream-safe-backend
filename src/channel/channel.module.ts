import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    controllers: [ChannelController],
    providers: [ChannelService, PrismaService, JwtService]
})
export class ChannelModule {}
