import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { SavedFile, ExchangedKey } from '@prisma/client';

@Injectable()
export class FilesService {
    constructor(private prisma: PrismaService) {}

    async uploadFile(videoInfo: UploadFileDto, file: Express.Multer.File, emailFromToken: string): Promise<SavedFile> {
        try {
            if (!videoInfo || !file) {
                throw new HttpException('Bad Request - Missing required parameters', HttpStatus.BAD_REQUEST);
            }

            const videoInfoJSON = JSON.parse(JSON.stringify(videoInfo));

            if(emailFromToken !== videoInfoJSON.senderEmail){
                throw new HttpException('Unauthorized upload', HttpStatus.UNAUTHORIZED);
            }
            const conv = await this.prisma.exchangedKey.findFirst({
                where: {
                    OR: [
                        {
                            AND: [
                                { senderEmail: videoInfoJSON.senderEmail },
                                { receiverEmail: videoInfoJSON.receiverEmail },
                            ],
                        },
                        {
                            AND: [
                                { senderEmail: videoInfoJSON.receiverEmail },
                                { receiverEmail: videoInfoJSON.senderEmail },
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
                    delivered:false,
                    sender:{
                        connect:{
                            email: videoInfoJSON.senderEmail
                        }
                    },
                    receiver:{
                        connect:{
                            email: videoInfoJSON.receiverEmail
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
}
