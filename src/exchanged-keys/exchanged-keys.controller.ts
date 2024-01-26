import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards,Req, Get } from '@nestjs/common';
import { ExchangedKeysService } from './exchanged-keys.service';
import { ExchangedKeys as ExchangedKeysModel, User as UserModel } from '@prisma/client';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeSymmetricDto } from './dto/exchange-symmetric.dto';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('exchanged-keys')
@Controller('exchanged-keys')
export class ExchangedKeysController {
    constructor(private readonly exchangedKeysService: ExchangedKeysService) {}
    @Post('exchangeSymmetric')
    @ApiOperation({ summary: 'Exchange symmetric keys between the sender and the reciever for the first communication' })
    @ApiResponse({ status: 201, description: 'Message sent successfully'})
    @ApiResponse({ status: 401, description: 'cant find users' })

    @ApiBody({
        type: ExchangeSymmetricDto,
        description: 'Json structure that contains user1 and user2 emails and the exchanged key',
    })

    async exchangeSymmetric(
        @Body() user2Data: ExchangeSymmetricDto,
        @Req() req:any,
    ): Promise<Boolean> {
        const userEmailFromToken = req['userEmail'];
        return this.exchangedKeysService.exchangeSymmetricKey(userEmailFromToken,user2Data.email,user2Data.key)
    }

    @Get('receiverSeen')
    @ApiOperation({ summary: 'The receiver received the symmetric key' })
    @ApiResponse({ status: 201, description: 'Seen'})
    @ApiResponse({ status: 401, description: 'no new keys found for this user' })

    async receiverSeen(
        @Req() req:any,
    ): Promise<ExchangedKeysModel[]> {
        const userEmailFromToken = req['userEmail'];
        return this.exchangedKeysService.receiverSeen(userEmailFromToken);
    }

}
