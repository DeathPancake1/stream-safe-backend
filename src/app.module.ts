import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { UserService } from './user/user.service';
import { PrismaService } from './helpers/database/prisma.service';
import { DeviceModule } from './device/device.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ExchangedKeysModule } from './exchanged-keys/exchanged-keys.module';
import { FilesService } from './files/files.service';
import { FilesModule } from './files/files.module';
import { ChannelService } from './channel/channel.service';
import { ChannelModule } from './channel/channel.module';
import { ChannelFilesModule } from './channel-files/channel-files.module';
import { PhotosController } from './photos/photos.controller';
import { PhotosService } from './photos/photos.service';
import { ChannelRequestModule } from './channel-request/channel-request.module';

@Module({
  imports: [ 
    AuthModule, 
    ConfigModule.forRoot(), 
    UserModule, 
    DeviceModule, 
    ExchangedKeysModule, 
    FilesModule, 
    ChannelModule, 
    ChannelFilesModule, ChannelRequestModule,
  ],
  controllers: [PhotosController],
  providers: [ JwtStrategy, UserService, PrismaService, FilesService, ChannelService, PhotosService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth', method: RequestMethod.GET },
        { path: 'auth', method: RequestMethod.POST },
        'auth/(.*)',
      )
      .forRoutes('');
  }
}
