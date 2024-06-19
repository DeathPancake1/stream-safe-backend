import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/helpers/database/prisma.service";
import { ChannelRequest } from "@prisma/client";
import { ChannelService } from "src/channel/channel.service";
import { AddMemberDTO } from "src/channel/dto/add-member.dto";

@Injectable()
export class ChannelRequestService {
    constructor(
        private prisma: PrismaService,
        private channelService: ChannelService
    ) {}

    async getChannelRequests(email: string): Promise<ChannelRequest[]> {
        const ownerUser = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
            },
        });
        const ownedChannels = await this.prisma.channel.findMany({
            where: {
                ownerId: ownerUser.id,
            },
            select: {
                id: true,
            },
        });
        let ownedChannelIds: string[] = [];
        for (let i = 0; i < ownedChannels.length; i++) {
            ownedChannelIds.push(ownedChannels[i].id);
        }
        const channelRequests = await this.prisma.channelRequest.findMany({
            where: {
                channelId: { in: ownedChannelIds },
            },
        });
        return channelRequests;
    }

    async createChannelRequest(
        email: string,
        channelId: string
    ): Promise<boolean> {
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                subscribers: true,
            },
        });
        let member = false;
        let exists = false;
        for (let i = 0; i < channel.subscribers.length; i++) {
            if (channel.subscribers[i].email === email) {
                member = true;
            }
        }
        exists = !this.prisma.channelRequest.findFirst({
            where: {
                senderEmail: email,
                channelId: channelId,
            },
        });
        if (!member && !exists) {
            const request = await this.prisma.channelRequest.create({
                data: {
                    channelId: channelId,
                    senderEmail: email,
                },
            });
        } else {
            return false;
        }
        return true;
    }

    async respondChannelRequest(
        email: string,
        requestId: number,
        response: boolean,
        key: string
    ): Promise<boolean> {
        const ownerUser = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
            },
        });
        const channelRequest = await this.prisma.channelRequest.findUnique({
            where: {
                id: requestId,
            },
            include: {
                channel: true,
            },
        });

        if (channelRequest.channel.ownerId === ownerUser.id) {
            await this.prisma.channelRequest.delete({
                where: {
                    id: requestId,
                },
            });
            if (response) {
                const args: AddMemberDTO = {
                    channelId: channelRequest.channelId,
                    newMemberEmails: channelRequest.senderEmail,
                    key: key,
                };
                await this.channelService.addMember(args, email);
            }
        } else {
            return false;
        }

        return true;
    }
}
