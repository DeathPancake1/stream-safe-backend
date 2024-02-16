import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards, Req, Get, UploadedFile, UploadedFiles, Res, StreamableFile } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadFileDto } from './dto/upload-file.dto';
import * as fs from 'fs';
import { SavedFile as SavedFileModel } from '@prisma/client';
import { UploadFileService } from './upload-file.service';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Files')
@Controller('upload-file')
export class UploadFileController {
    constructor(private readonly uploadFileService: UploadFileService) {}
    @Post('upload')
    @ApiOperation({ summary: 'upload the video to server' })
    @ApiResponse({ status: 201, description: 'File is sent successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiResponse({ status: 401, description: 'Failed to find the key between two users' })
    @ApiBody({
        type: UploadFileDto,
        description: 'The sender and receiver of the encrypted symmetric key and the name of the video',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const temp = req.body.senderEmail > req.body.receiverEmail
                    ? `./storage/videos/${req.body.senderEmail}_${req.body.receiverEmail}`
                    : `./storage/videos/${req.body.receiverEmail}_${req.body.senderEmail}`;

                if (!fs.existsSync(temp)) {
                    // Create the directory
                    fs.mkdirSync(temp);
                }
                return cb(null, temp);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async uploadFile(
        @Body() videoInfo: UploadFileDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        try {
            if (!videoInfo || !file || !req) {
                throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
            }

            const userEmailFromToken = req['userEmail'];
            const result = await this.uploadFileService.uploadFile(videoInfo, file, userEmailFromToken);

            if (!result) {
                throw new HttpException('Failed to find the key between two users', HttpStatus.UNAUTHORIZED);
            }

        } catch (error) {
            throw new HttpException(error.message || 'unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }
}
