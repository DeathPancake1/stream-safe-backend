import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards, Req, Get, UploadedFile, UploadedFiles, Res, StreamableFile } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PrismaService } from 'src/helpers/database/prisma.service';
import { SavedFile as SavedFileModel } from '@prisma/client';
import { DownloadFileDto } from './dto/download-file.dto';


// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('DownloadFile')
@Controller('download-file')
export class DownloadFileController {
    @Post('downloadVideo')
    @ApiOperation({ summary: 'download certain video' })
    @ApiBody({
        type: DownloadFileDto,
        description: 'The email of the other user',
    })
    async downloadVideo(
        @Body() data: DownloadFileDto,
        @Req() req
     ):Promise<string> {
        try{
            const partsArray = data.path.split("\\");
            if(partsArray[partsArray.length-2].includes(req['userEmail'])){
                const fileExists = fs.existsSync(data.path);
                if (!fileExists) {
                    throw new HttpException('File not found', HttpStatus.NOT_FOUND);
                  }
                // const name = partsArray[partsArray.length-1].split(".")[0]
                // const name = partsArray[partsArray.length-1]
                const fileContent = fs.readFileSync(data.path, 'base64')
                return fileContent.toString();
            }
            else{
                throw new HttpException('User not authorized to download', HttpStatus.UNAUTHORIZED);
            }  
        }
        catch(error){
            throw new HttpException(error.message || 'Not Found', HttpStatus.NOT_FOUND);
        }
    }
}
