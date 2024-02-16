import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UploadFileDto } from '../upload-file/dto/upload-file.dto';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { SavedFile, ExchangedKey } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class FilesService {
    constructor(private prisma: PrismaService) {}

    async uploadFile(videoInfo: UploadFileDto, file: Express.Multer.File, emailFromToken: string): Promise<SavedFile> {
        try {
            if (!videoInfo || !file) {
                throw new HttpException('Bad Request - Missing required parameters', HttpStatus.BAD_REQUEST);
            }

            const videoInfoTemp = JSON.parse(JSON.stringify(videoInfo));

            if(emailFromToken !== videoInfoTemp.senderEmail){
                throw new HttpException('Unauthorized upload', HttpStatus.UNAUTHORIZED);
            }
            const conv = await this.prisma.exchangedKey.findFirst({
                where: {
                    OR: [
                        {
                            AND: [
                                { senderEmail: videoInfoTemp.senderEmail },
                                { receiverEmail: videoInfoTemp.receiverEmail },
                            ],
                        },
                        {
                            AND: [
                                { senderEmail: videoInfoTemp.receiverEmail },
                                { receiverEmail: videoInfoTemp.senderEmail },
                            ],
                        },
                    ],
                },
            });

            if (!conv) {
                throw new HttpException('Exchanged key not found', HttpStatus.UNAUTHORIZED);
            }

            const savedFile = await this.prisma.savedFile.create({
                data: {
                    exchangedKey: {
                        connect: {
                            id: conv.id,
                        },
                    },
                    name: file.originalname,
                    path: file.path,
                    size: file.size,
                    type: videoInfoTemp.type,
                    iv: videoInfoTemp.iv,
                    delivered:false,
                    sender:{
                        connect:{
                            email: videoInfoTemp.senderEmail
                        }
                    },
                    receiver:{
                        connect:{
                            email: videoInfoTemp.receiverEmail
                        }
                    }
                },
            });

            return savedFile;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; // Re-throw known HTTP exceptions
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async makeDeliveredTrue(receiverEmail: string):Promise<SavedFile[]>{
        const savedFiles = await this.prisma.savedFile.findMany({
            where:{
                receiverEmail: receiverEmail,
                delivered:false
            }
        })
        if(savedFiles.length){
            await this.prisma.savedFile.updateMany({
                where:{
                    receiverEmail: receiverEmail,
                    delivered:false
                },
                data:{
                    delivered:true
                }
            })
        }
        return savedFiles
    }
    async getMessages(receiverEmail: string,senderEmail:string):Promise<SavedFile[]>{
        const savedFiles = await this.prisma.savedFile.findMany({
            where:{
                OR:[{
                receiverEmail: receiverEmail,
                senderEmail:senderEmail
                },
                {
                receiverEmail: senderEmail,
                senderEmail:receiverEmail
                }]
            }
        })
        return savedFiles
    }
    async downloadVideo(name:string,path:string):Promise<string>{
        try {
            // Read the content of the file synchronously
            const fileContent = fs.readFileSync(path, 'utf-8');
            return fileContent;
          } catch (error) {
            throw new Error(`Error reading file: ${error.message}`);
          }
        return
    }
}
