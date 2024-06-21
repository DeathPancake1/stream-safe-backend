import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { UploadFileDto } from "./dto/upload-file.dto";
import { PrismaService } from "src/helpers/database/prisma.service";
import { SavedFile, ExchangedKey, Video, VideoMessage } from "@prisma/client";
import * as fs from "fs";
import { channel, subscribe } from "diagnostics_channel";

@Injectable()
export class ChannelFilesService {
    constructor(private prisma: PrismaService) {}

    async uploadFile(
        videoInfo: UploadFileDto,
        file: Express.Multer.File,
        emailFromToken: string
    ): Promise<Video> {
        try {
            if (!videoInfo || !file) {
                throw new HttpException(
                    "Bad Request - Missing required parameters",
                    HttpStatus.BAD_REQUEST
                );
            }

            const channel = await this.prisma.channel.findFirst({
                where: {
                    AND: [
                        { id: videoInfo.channelId },
                        { owner: { email: emailFromToken } },
                    ],
                },
                include: {
                    subscribers: true,
                },
            });

            if (!channel) {
                throw new HttpException(
                    "Unauthorized upload",
                    HttpStatus.UNAUTHORIZED
                );
            }

            const video = await this.prisma.video.create({
                data: {
                    name: file.originalname,
                    path: file.path,
                    size: file.size,
                    type: videoInfo.type,
                    iv: videoInfo.iv,
                    channel: {
                        connect: {
                            id: channel.id,
                        },
                    },
                },
            });

            const videoMessagesData = await Promise.all(
                channel.subscribers.map(async (subscriber) => {
                    const latestExchangedKey =
                        await this.prisma.exchangedKey.findFirst({
                            where: {
                                AND: [
                                    { channelId: channel.id },
                                    {
                                        OR: [
                                            {
                                                senderEmail: emailFromToken,
                                                receiverEmail: subscriber.email,
                                            },
                                            {
                                                senderEmail: subscriber.email,
                                                receiverEmail: emailFromToken,
                                            },
                                        ],
                                    },
                                ],
                            },
                            orderBy: {
                                exchangedDate: "desc",
                            },
                        });

                    if (!latestExchangedKey) {
                        throw new HttpException(
                            "Exchanged key not found for subscriber",
                            HttpStatus.NOT_FOUND
                        );
                    }

                    return {
                        receiverEmail: subscriber.email,
                        delivered: false,
                        videoId: video.id,
                        usedKeyId: latestExchangedKey.id,
                    };
                })
            );

            await this.prisma.videoMessage.createMany({
                data: videoMessagesData,
            });

            return video;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; // Re-throw known HTTP exceptions
            } else {
                throw new HttpException(
                    "Internal Server Error",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async getMessages(emailFromToken: string): Promise<VideoMessage[]> {
        const videos = await this.prisma.videoMessage.findMany({
            where: {
                AND: [
                    {
                        receiverEmail: emailFromToken,
                    },
                    {
                        delivered: false,
                    },
                ],
            },
            include: {
                video: true,
                usedKey: true
            },
        });

        await this.prisma.videoMessage.updateMany({
            where: {
                AND: [
                    {
                        receiverEmail: emailFromToken,
                    },
                    {
                        delivered: false,
                    },
                ],
            },
            data: {
                delivered: true,
            },
        });

        return videos;
    }
}
