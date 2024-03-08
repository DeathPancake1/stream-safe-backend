import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class receiveOTPDTO{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email of the user',
    })
    @IsString()
    readonly email: string;
    @ApiProperty({
        example: '655559',
        description: 'OTP',
    })
    @IsString()
    readonly otp: string;
}