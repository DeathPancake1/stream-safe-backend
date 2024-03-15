import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { CreateChannelDTO } from './dto/create-channel.dto';
import { Channel } from '@prisma/client';
import { AddMembersDTO } from './dto/add-members.dto';
import { GetMembersDTO, GetMembersReturnDTO } from './dto/get-members.dto';

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
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: CreateChannelDTO,
        description: 'Json structure for channel object',
    })
    async createChannel(
        @Body() channelData: CreateChannelDTO,
        @Req() req:any,
    ): Promise<String> {
        const userEmailFromToken = req['userEmail'];
        return this.channelService.createChannel(channelData, userEmailFromToken)
    }


    @Post('addMembers')
    @ApiOperation({ summary: 'Add members to a channel' })
    @ApiResponse({ status: 201, description: 'Members are added.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: AddMembersDTO,
        description: 'Json structure for members to be added',
    })
    async addMemebers(
        @Body() newMembers: AddMembersDTO,
        @Req() req:any,
    ): Promise<string[]> {
        const userEmailFromToken = req['userEmail'];
        return this.channelService.addMembers(newMembers, userEmailFromToken)
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
}
