import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PhotosService } from './photos.service';
import { GetPhotoPathByIdDTO } from './dto/get-photo-path-by-id.dto';
import { GetPhotoByPathDTO } from './dto/get-photo-by-path.dto';
import * as path from 'path';
import * as fs from 'fs';



// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Photo')
@Controller('photos')
export class PhotosController {
    constructor(private readonly photosService: PhotosService) {}
    
    @Post('getPhotoPathById')
    @ApiOperation({ summary: 'gets the photo path in the backend by id' })
    @ApiResponse({ status: 201, description: 'Member is added.'})
    @ApiResponse({ status: 500, description: 'error loading image'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: GetPhotoPathByIdDTO,
        description: 'id of the photo needed',
    })
    async getPhotoPathById(
        @Body() photoId: GetPhotoPathByIdDTO,
        @Res() res:any
    ) {
        try{
            var id = await this.photosService.getPhotoPathById(photoId.id)
            res.status(201).json({message: id})
            return
        }catch(error){
            res.status(500).json({message: 'fail'})
        }
    }

    @Post('getPhotoByPath')
    @ApiOperation({ summary: 'gest the photo file from the path' })
    @ApiResponse({ status: 201, description: 'Image sent.'})
    @ApiResponse({ status: 500, description: 'error loading image'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: GetPhotoByPathDTO,
        description: 'path of the photo needed',
    })
    async getPhotoByPath(
        @Body() photoPath: GetPhotoByPathDTO,
        @Res() res:any
    ) {
            const imagePath = path.join(__dirname,'..','..',photoPath.path);
            if (fs.existsSync(imagePath)) {
                res.sendFile(imagePath);
              } else {
                res.status(404).send('Image not found');
              }
    }
}
