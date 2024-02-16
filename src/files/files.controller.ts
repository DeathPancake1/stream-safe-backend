import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards, Req, Get, UploadedFile, UploadedFiles, Res, StreamableFile } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadFileDto } from '../upload-file/dto/upload-file.dto';
import * as fs from 'fs';
import { FilesService } from './files.service';
import { SavedFile as SavedFileModel } from '@prisma/client';
import { GetMessagesFromChatDto } from './dto/get-messages-from-chat.dto';

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

}
