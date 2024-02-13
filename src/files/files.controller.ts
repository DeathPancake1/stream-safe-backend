import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards, Req, Get, UploadedFile, UploadedFiles, Res, StreamableFile } from '@nestjs/common';
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
import { PrismaService } from 'src/helpers/database/prisma.service';
import { FilesService } from './files.service';
import { SavedFile as SavedFileModel } from '@prisma/client';
import { GetMessagesFromChatDto } from './dto/get-messages-from-chat.dto';
import { DownloadFileDto } from './dto/download-file.dto';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

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
                const parentDirectory = join('storage', 'videos');

                // Ensure the parent directory exists
                if (!fs.existsSync(parentDirectory)) {
                    fs.mkdirSync(parentDirectory, { recursive: true });
                }
                const temp = req.body.senderEmail > req.body.receiverEmail
                    ? join(parentDirectory, `${req.body.senderEmail}_${req.body.receiverEmail}`)
                    : join(parentDirectory, `${req.body.receiverEmail}_${req.body.senderEmail}`)
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
            const result = await this.filesService.uploadFile(videoInfo, file, userEmailFromToken);

            if (!result) {
                throw new HttpException('Failed to find the key between two users', HttpStatus.UNAUTHORIZED);
            }

        } catch (error) {
            throw new HttpException(error.message || 'unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }
    @Get('deliveredVideos')
    @ApiOperation({ summary: 'check if new messages are sent' })
    @ApiResponse({ status: 200, description: 'savedFiles information is sent successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiResponse({ status: 304, description: 'No new videos found' })
    async deliveredVideos(
        @Req() req,
    ):Promise<SavedFileModel[]>{
        const userEmailFromToken = req['userEmail'];
        try{
            const savedFiles = await this.filesService.makeDeliveredTrue(userEmailFromToken)
            return savedFiles;
        }
        catch(error){
            throw new HttpException(error.message || 'unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('GetMessagesFromChat')
    @ApiOperation({ summary: 'Get the messages of a certain chat' })
    @ApiResponse({ status: 201, description: 'Chat is loaded successfully'})
    @ApiResponse({ status: 400, description: 'Bad Request'})
    @ApiBody({
        type: GetMessagesFromChatDto,
        description: 'The email of the other user',
    })
    async GetMessagesFromChat(
        @Body() sender: GetMessagesFromChatDto,
        @Req() req
    ):Promise<SavedFileModel[]>{
        const userEmailFromToken = req['userEmail'];
        try{
        const savedFiles = await this.filesService.getMessages(userEmailFromToken, sender.email)
        return savedFiles;
        }
        catch(error){
            throw new HttpException(error.message || 'unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('downloadVideo')
    @ApiOperation({ summary: 'download certain video' })
    @ApiBody({
        type: DownloadFileDto,
        description: 'The email of the other user',
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
