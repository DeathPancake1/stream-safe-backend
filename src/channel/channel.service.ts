import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { CreateChannelDTO } from './dto/create-channel.dto';
import { AddMemberDTO } from './dto/add-member.dto';
import { GetMembersDTO, GetMembersReturnDTO } from './dto/get-members.dto';
import { KeyType } from '@prisma/client';

@Injectable()
export class ChannelService {
    constructor(private prisma: PrismaService) {}

    async createChannel (
        newChannel: CreateChannelDTO,
        ownerEmail: string
    ): Promise<String | null>{
        const userOwner = await this.prisma.user.findUnique({
            where: {
                email: ownerEmail
            }
        })
        if(!userOwner){
            throw new UnauthorizedException('User email not found');
        }

        const createdChannel = await this.prisma.channel.create({
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
        return createdChannel.id
    }

    async addMember (
        channelData: AddMemberDTO,
        ownerEmail: string
    ): Promise<string | null>{
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

        const existingSubscribers = await this.prisma.channel.findFirst({
            where: {
                AND: [
                    { id: channelData.channelId },
                    { subscribers: { some: { id: { in: newMembers.map(member => member.id) } } } }
                ]
            }
        });
    
        if (existingSubscribers) {
            throw new BadRequestException('One or more users are already subscribed to the channel');
        }

        await this.prisma.exchangedKey.create({
            data: {
                sender:{
                    connect:{
                        email: userOwner.email
                    }
                },
                receiver:{
                    connect:{
                        email: newMembers[0].email
                    }
                },
                channel: {
                    connect: {
                        id: channelData.channelId
                    }
                },
                type: KeyType.CHANNEL,
                encryptedKey: channelData.key,
                delivered: false
            }
        })

        const updatedChannel = await this.prisma.channel.update({
            where: { id: checkChannel.id },
            data: {
                subscribers:{
                    connect: newMembers.map((member) => ({ id: member.id })),
                },
                totalMembers: checkChannel.totalMembers + newMembers.length
            }
        })

        return channelData.newMemberEmails
    }

    async getMembers (
        channelData: GetMembersDTO,
        userEmailFromToken: string
    ): Promise<GetMembersReturnDTO| null>{
        const userOwner = await this.prisma.user.findUnique({
            where: {
                email: userEmailFromToken
            }
        })
        if(!userOwner){
            throw new UnauthorizedException('User email not found');
        }

        const channel = await this.prisma.channel.findFirst({
            where: {
                AND: [
                    { id: channelData.channelId },
                    {
                        OR: [
                            { subscribers: { some: { email: userEmailFromToken } } },
                            { owner: { email: userEmailFromToken } }
                        ]
                    }
                ]
            },
            include:{
                subscribers: {
                    select: {
                        email: true
                    }
                }
            }
        })
        if(!channel){
            throw new UnauthorizedException('Channel not found');
        }

        

        return { totalMembers: channel.totalMembers, subscribers: channel.subscribers }
    }
}
