import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
    async getDeviceId (
        @Body() userData: DeviceIdDto,
        @Req() req: any,
    ): Promise<string> {
        const userEmailFromToken = req['userEmail'];
        const rand = await (await this.deviceService.generateRandId()).toString()
        this.deviceService.savePublicId(userEmailFromToken, userData.publicKey, rand)
        return rand
    }
}
