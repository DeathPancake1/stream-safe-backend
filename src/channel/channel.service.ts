import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/helpers/database/prisma.service";
import { CreateChannelDTO } from "./dto/create-channel.dto";
import { AddMemberDTO } from "./dto/add-member.dto";
import { GetMembersDTO, GetMembersReturnDTO } from "./dto/get-members.dto";
import { KeyType } from "@prisma/client";
import path from "path";
import * as fs from "fs";

@Injectable()
export class ChannelService {
    constructor(private prisma: PrismaService) { }

    async getChannelInfoById(id: string) {
        try {
            var channelInfo = await this.prisma.channel.findUnique({
                where: {
                    id: String(id),
                },
            });

            return channelInfo;
        } catch (error) {
            throw new Error("Didn't find the channel");
        }
    }

    async getAllChannels() {
        try {
            var channels = await this.prisma.channel.findMany({
                where: {
                    private: false,
                },
            });
            return channels;
        } catch (error) {
            throw new Error("Failed to fetch channels");
        }
    }

    async searchAllChannels(name: string) {
        try {
            var channels = await this.prisma.channel.findMany({
                where: {
                    AND: [
                        {
                            private: false,
                        },
                        {
                            title: {
                                contains: name,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            });
            return channels;
        } catch (error) {
            throw new Error("Failed to fetch channels");
        }
    }

    async getMyChannels(userEmailFromToken: string) {
        try {
            var ownedChannels = await this.prisma.channel.findMany({
                where: {
                    owner: {
                        email: userEmailFromToken,
                    },
                },
            });
            var registeredchannels = await this.prisma.channel.findMany({
                where: {
                    subscribers: {
                        some: {
                            email: userEmailFromToken,
                        },
                    },
                }
            })
            return {ownedChannels,registeredchannels};
        } catch (error) {
            throw new Error("Failed to fetch channels");
        }
    }

    async searchMyChannels(userEmailFromToken: string, searchTitle: string) {
        try {
            var channels = await this.prisma.channel.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                {
                                    owner: {
                                        email: userEmailFromToken,
                                    },
                                },
                                {
                                    subscribers: {
                                        some: {
                                            email: userEmailFromToken,
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            title: {
                                contains: searchTitle,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            });
            return channels;
        } catch (error) {
            throw new Error("Failed to fetch channels");
        }
    }

    async createChannel(
        newChannel: CreateChannelDTO,
        file: Express.Multer.File,
        isPrivate: boolean,
        ownerEmail: string
    ) {
        const userOwner = await this.prisma.user.findUnique({
            where: {
                email: ownerEmail,
            },
        });
        if (!userOwner) {
            throw new UnauthorizedException("User email not found");
        }
        let thumbnailPhotoId: number | undefined;
        if (file) {
            const thumbnailPhoto = await this.prisma.photo.create({
                data: {
                    path: file.path,
                },
            });
            thumbnailPhotoId = thumbnailPhoto.id;
        }
        const createdChannel = await this.prisma.channel.create({
            data: {
                title: newChannel.title,
                description: newChannel.description,
                private: isPrivate,
                owner: {
                    connect: {
                        id: userOwner.id,
                    },
                },
                totalMembers: 0,
                thumbnail: thumbnailPhotoId
                    ? {
                        connect: {
                            id: thumbnailPhotoId,
                        },
                    }
                    : undefined,
            },
        });
        return createdChannel.id;
    }

    async addMember(
        channelData: AddMemberDTO,
        ownerEmail: string
    ): Promise<string | null> {
        const userOwner = await this.prisma.user.findUnique({
            where: {
                email: ownerEmail,
            },
        });
        if (!userOwner) {
            throw new UnauthorizedException("User email not found");
        }

        const checkChannel = await this.prisma.channel.findFirst({
            where: {
                AND: [{ owner: userOwner }, { id: channelData.channelId }],
            },
        });
        if (!checkChannel) {
            throw new UnauthorizedException("Channel not found");
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
                    {
                        subscribers: {
                            some: { id: { in: newMembers.map((member) => member.id) } },
                        },
                    },
                ],
            },
        });

        if (existingSubscribers) {
            throw new BadRequestException(
                "One or more users are already subscribed to the channel"
            );
        }

        await this.prisma.exchangedKey.create({
            data: {
                sender: {
                    connect: {
                        email: userOwner.email,
                    },
                },
                receiver: {
                    connect: {
                        email: newMembers[0].email,
                    },
                },
                channel: {
                    connect: {
                        id: channelData.channelId,
                    },
                },
                type: KeyType.CHANNEL,
                encryptedKey: channelData.key,
                delivered: false,
            },
        });

        const updatedChannel = await this.prisma.channel.update({
            where: { id: checkChannel.id },
            data: {
                subscribers: {
                    connect: newMembers.map((member) => ({ id: member.id })),
                },
                totalMembers: checkChannel.totalMembers + newMembers.length,
            },
        });

        return channelData.newMemberEmails;
    }

    async getMembers(
        channelData: GetMembersDTO,
        userEmailFromToken: string
    ): Promise<GetMembersReturnDTO | null> {
        const userOwner = await this.prisma.user.findUnique({
            where: {
                email: userEmailFromToken,
            },
        });
        if (!userOwner) {
            throw new UnauthorizedException("User email not found");
        }

        const channel = await this.prisma.channel.findFirst({
            where: {
                AND: [
                    { id: channelData.channelId },
                    {
                        OR: [
                            { subscribers: { some: { email: userEmailFromToken } } },
                            { owner: { email: userEmailFromToken } },
                        ],
                    },
                ],
            },
            include: {
                subscribers: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        if (!channel) {
            throw new UnauthorizedException("Channel not found");
        }

        return {
            totalMembers: channel.totalMembers,
            subscribers: channel.subscribers,
        };
    }

    async checkIfMember(id: string, email: string) {
        try {
            const channel = await this.prisma.channel.findUnique({
                where: {
                    id: id,
                },
                include: {
                    subscribers: true
                }
            });

            if (!channel) {
                throw new Error("Didn't find the channel");
            }
    
            const isMember = channel.subscribers.some(subscriber => subscriber.email === email);
            if (isMember){
                return "Member"
            }

            const request = await this.prisma.channelRequest.findFirst({
                where: {
                    channelId: id,
                    senderEmail: email
                }
            })

            if (!request) {
                return "Not Member"
            }else{
                return "Pending"
            }
        } catch (error) {
            throw new Error("Didn't find the channel");
        }
    }
}
