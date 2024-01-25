import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/auth/auth.middleware';


@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService]
})
export class UserModule {}
