import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { SavedFile, ExchangedKey, Video } from '@prisma/client';
import * as fs from 'fs';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChannelFilesService {
    constructor(private prisma: PrismaService) {}

    async uploadFile(videoInfo: UploadFileDto, file: Express.Multer.File, emailFromToken: string): Promise<Video> {
        try {
            if (!videoInfo || !file) {
                throw new HttpException('Bad Request - Missing required parameters', HttpStatus.BAD_REQUEST);
            }
            const channel = await this.prisma.channel.findFirst({
                where: {
                    AND: [
                        { id: videoInfo.channelId },
                        { owner: {
                            email: emailFromToken
                        }}
                    ]
                }
            })

            if(!channel){
                throw new HttpException('Unauthorized upload', HttpStatus.UNAUTHORIZED);
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
                            id: channel.id
                        }
                    }
                },
            });

            return video;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; // Re-throw known HTTP exceptions
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    
    async getMessages(channelId: string, emailFromToken:string):Promise<Video[]>{
        const channel = await this.prisma.channel.findFirst({
            where: {
                AND: [
                    { id: channelId },
                    {
                        OR: [
                            { subscribers: { some: { email: emailFromToken } } },
                            { owner: { email: emailFromToken } }
                        ]
                    }
                ]
            }
        })

        if(!channel){
            throw new HttpException('Unauthorized download', HttpStatus.UNAUTHORIZED);
        }

        const videos = await this.prisma.video.findMany({
            where:{
                channelId: channel.id
            }
        })
        return videos
    }
}
