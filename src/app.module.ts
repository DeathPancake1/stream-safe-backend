import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadFileModule } from './upload-file/upload-file.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [UploadFileModule, AuthModule, ConfigModule.forRoot(), UserModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
