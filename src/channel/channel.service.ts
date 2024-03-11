import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { CreateChannelDTO } from './dto/create-channel.dto';
import { Channel } from '@prisma/client';
import { AddMembersDTO } from './dto/add-members.dto';

@Injectable()
export class ChannelService {
    constructor(private prisma: PrismaService) {}

    async createChannel (
        newChannel: CreateChannelDTO,
        ownerEmail: string
    ): Promise<Channel | null>{
        const userOwner = await this.prisma.user.findUnique({
            where: {
                email: ownerEmail
            }
        })
        if(!userOwner){
            throw new UnauthorizedException('User email not found');
        }

        const createdChannel = this.prisma.channel.create({
            data: {
                ...newChannel,
                owner: {
                    connect: {
                        id: userOwner.id
                    }
                },
                totalMembers: 0
            }
        })
        return createdChannel
    }

    async addMembers (
        channelData: AddMembersDTO,
        ownerEmail: string
    ): Promise<string[] | null>{
        const userOwner = await this.prisma.user.findUnique({
            where: {
                email: ownerEmail
            }
        })
        if(!userOwner){
            throw new UnauthorizedException('User email not found');
        }

        const checkChannel = await this.prisma.channel.findFirst({
            where: {
                AND: [
                    { owner: userOwner },
                    { id: channelData.channelId },
                ],
            }
        })
        if(!checkChannel){
            throw new UnauthorizedException('Channel not found');
        }

        const newMembers = await this.prisma.user.findMany({
            where: {
              email: {
                in: channelData.newMemberEmails,
              },
            },
        });

        const updatedChannel = await this.prisma.channel.update({
            where: { id: checkChannel.id },
            data: {
                subscribers:{
                    connect: newMembers.map((member) => ({ id: member.id })),
                }
            }
        })

        return channelData.newMemberEmails
    }
}
