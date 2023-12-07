import { Body, Controller, HttpException, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGruard } from 'src/auth/guard/apikey-auth.guard';
import { JWTAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { DeviceIdDto } from './dto/deviceId-request.dto';
import { DeviceService } from './device.service';

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
}
