import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadFileModule } from './upload-file/upload-file.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { UserService } from './user/user.service';
import { PrismaService } from './helpers/database/prisma.service';
import { DeviceModule } from './device/device.module';
import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [UploadFileModule, AuthModule, ConfigModule.forRoot(), UserModule, DeviceModule ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, UserService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('device');
  }
}
