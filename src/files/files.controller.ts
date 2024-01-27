import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards,Req, Get, UploadedFile, UploadedFiles } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { uploadFileDto } from './dto/upload-file.dto';
import * as fs from 'fs';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { FilesService } from './files.service';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}
    @Post('upload')
    @ApiBody({
        type: uploadFileDto,
        description: 'the id of the encrypted symmetric key and the name of the video',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file',{
        storage: diskStorage({
            destination: (req,file, cb)=>{
                const temp = `./storage/videos/${req.body.id}`;
                if (!fs.existsSync(temp)) {
                    // Create the directory
                    fs.mkdirSync(temp);
                }
                return cb(null,temp)
            },
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                return cb(null, `${randomName}${extname(file.originalname)}`)
            }
        })
    }))
    async uploadFile(
        @Body() videoInfo: uploadFileDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req:any
        ) {
            const userEmailFromToken = req['userEmail'];
            return this.filesService.uploadFile(userEmailFromToken,videoInfo,file);
        }
}
