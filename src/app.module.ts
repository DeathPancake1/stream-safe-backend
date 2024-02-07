import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { UserService } from './user/user.service';
import { PrismaService } from './helpers/database/prisma.service';
import { DeviceModule } from './device/device.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ExchangedKeysController } from './exchanged-keys/exchanged-keys.controller';
import { ExchangedKeysModule } from './exchanged-keys/exchanged-keys.module';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { FilesModule } from './files/files.module';
import { DownloadFileController } from './download-file/download-file.controller';
import { DownloadFileService } from './download-file/download-file.service';
import { DownloadFileModule } from './download-file/download-file.module';

@Module({
  imports: [ AuthModule, ConfigModule.forRoot(), UserModule, DeviceModule, ExchangedKeysModule, FilesModule, DownloadFileModule ],
  controllers: [ FilesController, DownloadFileController],
  providers: [ JwtStrategy, UserService, PrismaService, FilesService, DownloadFileService],
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
