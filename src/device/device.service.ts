import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/helpers/database/prisma.service';

@Injectable()
export class DeviceService {
    constructor(private prisma: PrismaService) {}

    async generateRandId(): Promise<string>{
        const randBytes = await crypto.randomBytes(32);
        const randHex = randBytes.toString('hex');
        return randHex
    }

    async savePublicId(email: string, publicKey: string, rand: string){
        const user = await this.prisma.user.update({
            where: {
                email: email
            },
            data: {
                publicKey: publicKey,
                deviceId: rand
            },
            
        })
    }
}
