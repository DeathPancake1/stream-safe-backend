import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/helpers/database/prisma.service';

@Injectable()
export class PhotosService {
     
    constructor(private prisma: PrismaService) {}

    async getPhotoPathById(id: number) {
        try{
            var photoInfo = await this.prisma.photo.findUnique({
                where:{
                    id
                }
            })
            
            return photoInfo.path
        }catch(error){
            throw new Error('Didn\'t find the channel');
        }
    }
}
