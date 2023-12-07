import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/helpers/database/prisma.service';

@Injectable()
export class DeviceService {
    constructor(private prisma: PrismaService) {}

    async generateRandId(): Promise<Buffer>{
        const rand = await crypto.randomBytes(32)
        return rand
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
