import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [DeviceController],
  providers: [DeviceService, PrismaService, JwtService]
})
export class DeviceModule {}
