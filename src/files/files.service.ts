import { Injectable } from '@nestjs/common';
import { uploadFileDto } from './dto/upload-file.dto';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { SavedFile } from '@prisma/client';


@Injectable()
export class FilesService {
    constructor(private prisma: PrismaService) {}
    async uploadFile(videoInfo: uploadFileDto,file: Express.Multer.File) {
        const videoInfoTemp = JSON.parse(JSON.stringify(videoInfo))
        const conv = await this.prisma.exchangedKey.findFirst({
            where:{
                OR:[
                    {AND:[
                        {senderEmail:videoInfoTemp.senderEmail},
                        {receiverEmail:videoInfoTemp.receiverEmail}
                    ]},
                    {AND:[
                        {senderEmail:videoInfoTemp.receiverEmail},
                        {receiverEmail:videoInfoTemp.senderEmail}
                    ]
                    }
                ]
            }
        })
        await this.prisma.savedFile.create({
            data:{
                exchangedKey: {
                    connect:{
                        id: conv.id
                    }
                },
                name : file.originalname,
                path : file.path,
                size : file.size
            }
        });
    }
}
