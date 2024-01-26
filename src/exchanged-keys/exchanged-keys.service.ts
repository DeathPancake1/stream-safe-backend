import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { ExchangedKeys, User } from '@prisma/client'

@Injectable()
export class ExchangedKeysService {
    constructor(private prisma: PrismaService) {}
    async exchangeSymmetricKey(user1Email: string, user2Email: string, key: string): Promise<Boolean>{
        const user1 = await this.prisma.user.findUnique({
            where: {
                email: user1Email
            }
        })
        const user2 = await this.prisma.user.findUnique({
            where: {
                email: user2Email
            }
        })
        if (!user1 || !user2) {
            throw new UnauthorizedException('User not found');
        }
        await this.prisma.exchangedKeys.create({
            data: {
                senderEmail: user1Email,
                receiverEmail: user2Email,
                encryptedKey: key,
                seen: false
            }
        })
        return true;
    }
    async receiverSeen(
            userEmail: string
        ): Promise<ExchangedKeys[]>{
        const keys = await this.prisma.exchangedKeys.findMany({
            where:{
                receiverEmail: userEmail,
                seen:false
            }
        })
        await this.prisma.exchangedKeys.updateMany({
            where:{
                receiverEmail: userEmail,
                seen:false
            },
            data:{
                seen:true
            }
        })
        if(keys.length==0){
            throw new UnauthorizedException('No new keys found');
        }
        return keys
    }
}
