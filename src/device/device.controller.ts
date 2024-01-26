import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { DeviceIdDto } from './dto/deviceId-request.dto';
import { DeviceService } from './device.service';
import { CheckDeviceDto } from 'src/device/dto/check-device.dto';

// Added guard for Api key check
@UseGuards(ApiKeyAuthGruard)
@UseGuards(JWTAuthGuard)
// Adds swagger headers to the request
@ApiBearerAuth('api-key')
@ApiBearerAuth('JWT-auth')
@ApiTags('Device')
@Controller('device')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @Post('getId')
    @ApiOperation({ summary: 'Get a random generated device id' })
    @ApiResponse({ status: 201, description: 'The random id is returned.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: DeviceIdDto,
        description: 'Json structure for id request object',
    })
    async getDeviceId (
        @Body() userData: DeviceIdDto,
        @Req() req: any,
    ): Promise<string> {
        const userEmailFromToken = req['userEmail'];
        try{
            const rand = await this.deviceService.generateRandId(userEmailFromToken, userData.publicKey)
            return rand
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException('Updated less than a month ago', HttpStatus.UNAUTHORIZED);
            }
        }
    }

    @Get('isLocked')
    @ApiOperation({ summary: 'Is the account already device locked?' })
    @ApiResponse({ status: 200, description: 'True or False'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    async checkAccountLock (
        @Req() req: any,
    ): Promise<boolean> {
        const userEmailFromToken = req['userEmail'];
        try{
            const locked = await this.deviceService.checkAccountLock(userEmailFromToken)
            return locked
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
            }
        }
    }

    @Post('checkId')
    @ApiOperation({ summary: 'Chech if device id is valid' })
    @ApiResponse({ status: 201, description: 'The check is done.'})
    @ApiResponse({ status: 401, description: 'Forbidden.' })
    @ApiBody({
        type: CheckDeviceDto,
        description: 'Json structure for id request object',
    })
    async checkDeviceId (
        @Body() userData: CheckDeviceDto,
        @Req() req: any,
    ): Promise<boolean> {
        const userEmailFromToken = req['userEmail'];
        try{
            const valid = await this.deviceService.validateId(userEmailFromToken, userData.deviceId)
            return valid
        }
        catch(error){
            if(error instanceof UnauthorizedException){
                throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
            }
        }
    }
}
