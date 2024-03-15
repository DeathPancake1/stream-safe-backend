import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { ExchangedKey, User } from '@prisma/client'

@Injectable()
export class ExchangedKeysService {
    constructor(private prisma: PrismaService) {}
    async exchangeSymmetricKey(senderEmail: string, receiverEmail: string, key: string): Promise<Boolean>{
        const sender = await this.prisma.user.findUnique({
            where: {
                email: senderEmail
            }
        })
        const receiver = await this.prisma.user.findUnique({
            where: {
                email: receiverEmail
            }
        })
        if (!sender || !receiver) {
            throw new UnauthorizedException('User not found');
        }
        const exists = await this.checkConversationKey(senderEmail, receiverEmail)
        if(exists){
            throw new UnauthorizedException('Key already exists');
        }
        await this.prisma.exchangedKey.create({
            data: {
                sender:{
                    connect:{
                        email: senderEmail
                    }
                },
                receiver:{
                    connect:{
                        email: receiverEmail
                    }
                },
                encryptedKey: key,
                delivered: false
            }
        })
        return true;
    }
    async receiverDelivered(
            userEmail: string
        ): Promise<ExchangedKey[]>{
        const keys = await this.prisma.exchangedKey.findMany({
            where:{
                receiverEmail: userEmail,
                delivered:false
            },
            include: {
                channel: true
            }
        })
        if(keys.length){
            await this.prisma.exchangedKey.updateMany({
                where:{
                    receiverEmail: userEmail,
                    delivered:false
                },
                data:{
                    delivered:true
                }
            })
        }
        return keys
    }

    async checkConversationKey(
        senderEmail: string,
        receiverEmail: string
    ): Promise<Boolean>{
        const exchanged = await this.prisma.exchangedKey.findFirst({
            where:{
                OR: [
                    {
                        senderEmail: senderEmail,
                        receiverEmail: receiverEmail,
                    },
                    {
                        senderEmail: receiverEmail,
                        receiverEmail: senderEmail,
                    },
                ],
            }
        })

        return !!exchanged;
    }
}
