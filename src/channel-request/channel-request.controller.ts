import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChannelRequestService } from './channel-request.service';
import { ChannelRequest } from '@prisma/client';
import { CreateChannelRequestDto } from './dto/create-channel-request.dto';
import { RespondChannelRequestDto } from './dto/respond-channel-request.dto';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Channel-Requests')
@Controller('channelRequest')
export class ChannelRequestController {
    constructor(private readonly channelRequestService: ChannelRequestService) {}

    @Get('/')
    @ApiOperation({ summary: 'Get channel requests for all my channels' })
    @ApiResponse({ status: 200, description: 'The requests returned.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    async getChannelRequests (
        @Req() req: any,
    ): Promise<ChannelRequest[]> {
        const userEmailFromToken = req['userEmail'];
        try{
            const channelRequests = await this.channelRequestService.getChannelRequests(userEmailFromToken)
            return channelRequests
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
            }
        }
    }

    @Post('/')
    @ApiOperation({ summary: 'Create Channel Request' })
    @ApiResponse({ status: 201, description: 'created new channel request'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: CreateChannelRequestDto,
        description: 'Json structure for id request object',
    })
    async createChannelRequest (
        @Body() data: CreateChannelRequestDto,
        @Req() req: any,
    ): Promise<boolean> {
        const userEmailFromToken = req['userEmail'];
        try{
            const valid = await this.channelRequestService.createChannelRequest(userEmailFromToken, data.channelId)
            if(valid){
                return valid
            }else{
                throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
            }
            
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
            }
        }
    }

    @Post('respond')
    @ApiOperation({ summary: 'Respond to a Channel Request' })
    @ApiResponse({ status: 201, description: 'responded to channel request'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: RespondChannelRequestDto,
        description: 'Json structure for id request object',
    })
    async repondChannelRequest (
        @Body() data: RespondChannelRequestDto,
        @Req() req: any,
    ): Promise<boolean> {
        const userEmailFromToken = req['userEmail'];
        try{
            const valid = await this.channelRequestService.respondChannelRequest(userEmailFromToken, data.requestId, data.response === "true")
            return valid
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
            }
        }
    }
}
