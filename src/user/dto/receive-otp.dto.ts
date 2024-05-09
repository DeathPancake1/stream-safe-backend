import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsInt, IsString } from "class-validator";

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
    @ApiProperty({
        example: "VERIFYEMAIL",
        description: 'VERIFYEMAIL for verify the email and FORGETPASSWORD for forgetting password',
    })
    @IsString()
    readonly type: string;
}