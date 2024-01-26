import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CheckDeviceDto{
    @ApiProperty({
        example: '8261a3fe020f23a0a758165854290a7fdf0a6bd4279c525a71edeac5c789a401',
        description: 'Device Id',
    })
    @IsString()
    readonly deviceId: string;
}