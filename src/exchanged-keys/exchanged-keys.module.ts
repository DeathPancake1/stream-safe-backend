import { Module } from '@nestjs/common';
import { ExchangedKeysService } from './exchanged-keys.service';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ExchangedKeysController } from './exchanged-keys.controller';

@Module({
  controllers: [ExchangedKeysController],
  providers: [ExchangedKeysService,PrismaService,JwtService]
})
export class ExchangedKeysModule {}
