import { Body, Controller, HttpException, HttpStatus, Post, UseGuards, Req, Get, UploadedFile, Res } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadFileDto } from './dto/upload-file.dto';
import * as fs from 'fs';
import { Response } from 'express';
import { Video } from '@prisma/client';
import { GetMessagesFromChatDto } from './dto/get-messages-from-chat.dto';
import { DownloadFileDto } from './dto/download-file.dto';
import { ChannelFilesService } from './channel-files.service';
import { channel } from 'diagnostics_channel';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Channel-Files')
@Controller('channelFiles')
export class ChannelFilesController {
    constructor(private readonly channelFilesService: ChannelFilesService) {}

    @Post('upload')
    @ApiOperation({ summary: 'upload the video to server' })
    @ApiResponse({ status: 201, description: 'File is sent successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiResponse({ status: 401, description: 'Failed to find the key between two users' })
    @ApiBody({
        type: UploadFileDto,
        description: 'Video info and channel info',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const parentDirectory = join('storage', 'videos');

                // Ensure the parent directory exists
                if (!fs.existsSync(parentDirectory)) {
                    fs.mkdirSync(parentDirectory, { recursive: true });
                }
                const temp = join(parentDirectory, req.body.channelId)
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
            const result = await this.channelFilesService.uploadFile(videoInfo, file, userEmailFromToken);

            if (!result) {
                throw new HttpException("File couldn't be uploaded", HttpStatus.UNAUTHORIZED);
            }

        } catch (error) {
            throw new HttpException(error.message || 'unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('getMessagesFromChannel')
    @ApiOperation({ summary: 'Get the messages of a certain channel' })
    @ApiResponse({ status: 201, description: 'Chat is loaded successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiBody({
        type: GetMessagesFromChatDto,
        description: 'The channelId',
    })
    async getMessagesFromChat(
        @Body() channel: GetMessagesFromChatDto,
        @Req() req
    ):Promise<Video[]>{
        const userEmailFromToken = req['userEmail'];
        try{
        const videos = await this.channelFilesService.getMessages(channel.channelId, userEmailFromToken)
        return videos;
        }
        catch(error){
            throw new HttpException(error.message || 'unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('downloadVideo')
    @ApiOperation({ summary: 'download certain video' })
    @ApiBody({
        type: DownloadFileDto,
        description: 'The video path',
    })
    async downloadVideo(
        @Body() data: DownloadFileDto,
        @Res() res: Response,
    ): Promise<any> {
        try{
            const fileExists = fs.existsSync(data.path);
            if (!fileExists) {
                throw new HttpException('File not found', HttpStatus.NOT_FOUND);
            }
            const stream = fs.createReadStream(data.path);
            stream.pipe(res);
        }
        catch(error){
            throw new HttpException(error.message || 'Not Found', HttpStatus.NOT_FOUND);
        }
    }
}
