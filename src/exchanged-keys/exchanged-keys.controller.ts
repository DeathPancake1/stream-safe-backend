import { Body, Controller, HttpException, HttpStatus, Post, UnauthorizedException, UseGuards,Req, Get, HttpCode, Res } from '@nestjs/common';
import { ExchangedKeysService } from './exchanged-keys.service';
import { ExchangedKey as ExchangedKeysModel, User as UserModel } from '@prisma/client';
import { ApiResponse, ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeSymmetricDto } from './dto/exchange-symmetric.dto';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { CheckExchangedDTO } from './dto/check-exchanged.dto';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Exchanged-Keys')
@Controller('exchanged-keys')
export class ExchangedKeysController {
    constructor(private readonly exchangedKeysService: ExchangedKeysService) {}
    @Post('exchangeSymmetric')
    @ApiOperation({ summary: 'Exchange symmetric keys between the sender and the reciever for the first communication' })
    @ApiResponse({ status: 201, description: 'Message sent successfully'})
    @ApiResponse({ status: 401, description: 'cant find users' })

    @ApiBody({
        type: ExchangeSymmetricDto,
        description: 'Json structure that contains sender and reciever emails and the encrypted exchanged key',
    })

    async exchangeSymmetric(
        @Body() data: ExchangeSymmetricDto,
        @Req() req:any,
    ): Promise<Boolean> {
        const userEmailFromToken = req['userEmail'];
        return this.exchangedKeysService.exchangeSymmetricKey(userEmailFromToken,data.email,data.key)
    }

    @Get('/')
    @ApiOperation({ summary: 'The receiver received the symmetric key' })
    @ApiResponse({ status: 200, description: 'Seen'})
    async receiverDelivered(
        @Req() req:any,
    ): Promise<ExchangedKeysModel[]> {
        const userEmailFromToken = req['userEmail'];
        const keys = await this.exchangedKeysService.receiverDelivered(userEmailFromToken);
        return keys;
    }

    @Post('checkConversationKey')
    @ApiOperation({ summary: 'Exchange symmetric keys between the sender and the reciever for the first communication' })
    @ApiResponse({ status: 201, description: 'Message sent successfully'})
    @ApiResponse({ status: 401, description: 'cant find users' })

    @ApiBody({
        type: CheckExchangedDTO,
        description: 'Json structure that contains sender and reciever emails and the encrypted exchanged key',
    })

    async checkConversationKey(
        @Body() data: CheckExchangedDTO,
        @Req() req:any,
    ): Promise<Boolean> {
        const userEmailFromToken = req['userEmail'];
        return this.exchangedKeysService.checkConversationKey(userEmailFromToken,data.email)
    }

}
