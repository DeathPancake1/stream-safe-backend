import { Module } from '@nestjs/common';
import { ChannelRequestController } from './channel-request.controller';
import { ChannelRequestService } from './channel-request.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { ChannelService } from 'src/channel/channel.service';

@Module({
  controllers: [ChannelRequestController],
  providers: [ChannelRequestService, PrismaService, JwtService, ChannelService]
})
export class ChannelRequestModule {}
