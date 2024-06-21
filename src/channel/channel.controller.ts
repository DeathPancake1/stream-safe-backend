import { Body, Controller, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { CreateChannelDTO } from './dto/create-channel.dto';
import { Channel } from '@prisma/client';
import { AddMemberDTO } from './dto/add-member.dto';
import { GetMembersDTO, GetMembersReturnDTO } from './dto/get-members.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { getChannelByIdDTO } from './dto/get-channel-by-id.dto';
import { searchAllChannelsDTO } from './dto/search-all-channels.dto';
import { RemoveMemberDTO } from './dto/remove-member.dto';
import { ExchangeKeyDTO } from './dto/exchange-key.dto';


// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Channel')
@Controller('channel')
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {}

    @Post('createChannel')
    @ApiOperation({ summary: 'Create a new channel' })
    @ApiResponse({ status: 201, description: 'The channel is created.'})
    @ApiResponse({ status: 500, description: 'Couldn\'t create.' })
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: CreateChannelDTO,
        description: 'Json structure for channel object',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('thumbnailPhoto', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const parentDirectory = join('storage', 'images', 'channels');
                if (!fs.existsSync(parentDirectory)) {
                    fs.mkdirSync(parentDirectory, { recursive: true });
                }
                console.log(req.body)
                const temp = join(parentDirectory, `${req.body.title}`)
                if (!fs.existsSync(temp)) {
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
    async createChannel(
        @Body() channelData: CreateChannelDTO,
        @UploadedFile() file: Express.Multer.File,
        @Req() req:any,
        @Res() res:any
    ) {
        const userEmailFromToken = req['userEmail'];
        try{
            const channelId = await this.channelService.createChannel(channelData,file,channelData.private === "true", userEmailFromToken)
            res.status(201).json(channelId)
            return
        }catch(error){
            res.status(500).json({message: 'fail'})
        }
    }


    @Post('addMember')
    @ApiOperation({ summary: 'Add member to a channel' })
    @ApiResponse({ status: 201, description: 'Member is added.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: AddMemberDTO,
        description: 'Json structure for member to be added',
    })
    async addMemeber(
        @Body() newMembers: AddMemberDTO,
        @Req() req:any,
    ): Promise<string> {
        const userEmailFromToken = req['userEmail'];
        return this.channelService.addMember(newMembers, userEmailFromToken)
    }

    @Post('removeMember')
    @ApiOperation({ summary: 'Remove member from channel' })
    @ApiResponse({ status: 201, description: 'Member is removed.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: RemoveMemberDTO,
        description: 'Json structure for member to be removed',
    })
    async removeMemeber(
        @Body() data: RemoveMemberDTO,
        @Req() req:any,
    ): Promise<boolean> {
        const userEmailFromToken = req['userEmail'];
        return this.channelService.removeMember(data, userEmailFromToken)
    }

    @Post('exchangeChannelKey')
    @ApiOperation({ summary: 'Send channel key to user' })
    @ApiResponse({ status: 201, description: 'key is sent.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: ExchangeKeyDTO,
        description: 'Json structure for key to be exchanged',
    })
    async exchangeKey(
        @Body() data: ExchangeKeyDTO,
        @Req() req:any,
    ): Promise<boolean> {
        const userEmailFromToken = req['userEmail'];
        return this.channelService.exchangeKey(data, userEmailFromToken)
    }


    @Post('getMembers')
    @ApiOperation({ summary: 'Get channel members' })
    @ApiResponse({ status: 201, description: 'Members returned.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: GetMembersDTO,
        description: 'Json structure for channel',
    })
    async getMembers(
        @Body() data: GetMembersDTO,
        @Req() req:any,
    ): Promise<GetMembersReturnDTO> {
        const userEmailFromToken = req['userEmail'];
        return this.channelService.getMembers(data, userEmailFromToken)
    }
    
    @Post('getAllChannels')
    @ApiOperation({ summary: 'get all the channels in DB' })
    @ApiResponse({ status: 201, description: 'got the channels'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiResponse({ status: 500, description: 'Forbidden.' })
    
    async getAllChannels(
        @Res() res:any
    ) {
        try{
            var channels = await this.channelService.getAllChannels()
            res.status(201).json({message:channels}); 
            return
        }catch(error){
            res.status(500).json({ error: 'Failed to fetch channels' }); 
            return
        }
    }

    @Post('searchAllChannels')
    @ApiOperation({ summary: 'search all the channels in DB' })
    @ApiResponse({ status: 201, description: 'got the channels'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiResponse({ status: 500, description: 'Forbidden.' })
    @ApiBody({
        type: searchAllChannelsDTO,
        description: 'Json structure for channel',
    })
    async searchAllChannels(
        @Body() data: searchAllChannelsDTO,
        @Res() res:any
    ) {
        try{
            var channels = await this.channelService.searchAllChannels(data.title)
            res.status(201).json({message:channels}); 
            return
        }catch(error){
            res.status(500).json({ error: 'Failed to fetch channels' }); 
            return
        }
    }

    @Post('getMyChannels')
    @ApiOperation({ summary: 'get my channels in DB' })
    @ApiResponse({ status: 201, description: 'got the channels'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiResponse({ status: 500, description: 'Forbidden.' })
    
    async getMyChannels(
        @Req() req: any,
        @Res() res:any
    ) {
        try{
            const userEmailFromToken = req['userEmail'];
            var channels = await this.channelService.getMyChannels(userEmailFromToken)
            res.status(201).json({message:channels}); 
            return
        }catch(error){
            res.status(500).json({ error: 'Failed to fetch channels' }); 
            return
        }
    }

    @Post('searchMyChannels')
    @ApiOperation({ summary: 'search my channels in DB' })
    @ApiResponse({ status: 201, description: 'got the channels'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiResponse({ status: 500, description: 'Forbidden.' })
    @ApiBody({
        type: searchAllChannelsDTO,
        description: 'Json structure for channel',
    })
    async searchMyChannels(
        @Body() data: searchAllChannelsDTO,
        @Res() res:any,
        @Req() req:any
    ) {
        try{
            const userEmailFromToken = req['userEmail'];
            var channels = await this.channelService.searchMyChannels(userEmailFromToken, data.title)
            res.status(201).json({message:channels}); 
            return
        }catch(error){
            res.status(500).json({ error: 'Failed to fetch channels' }); 
            return
        }
    }


    @Post('getChannelInfoById')
    @ApiOperation({ summary: 'get all the channels in DB' })
    @ApiResponse({ status: 201, description: 'got them succesfully'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiResponse({ status: 500, description: 'failed.' })
    async getChannelInfoById(
        @Body() channelId:getChannelByIdDTO,
        @Res() res:any
    ) {
        try{
            var channelInfo = await this.channelService.getChannelInfoById(channelId.id)
            res.status(201).json({message:channelInfo}); 
            return
        }catch(error){
            res.status(500).json({ error: 'Didn\'t find the channel' }); 
            return
        }
    }

    @Post('checkIfMember')
    @ApiOperation({ summary: 'check if user is a member or requested to join a channel' })
    @ApiResponse({ status: 201, description: 'Not Member or Member or Pending'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiResponse({ status: 500, description: 'failed.' })
    async checkIfMember(
        @Body() channelId:getChannelByIdDTO,
        @Req() req: any,
        @Res() res:any
    ) {
        try{
            const userEmailFromToken = req['userEmail'];
            var channelInfo = await this.channelService.checkIfMember(channelId.id, userEmailFromToken)
            res.status(201).json({message:channelInfo}); 
            return
        }catch(error){
            res.status(500).json({ error: 'Didn\'t find the channel' }); 
            return
        }
    }

}
