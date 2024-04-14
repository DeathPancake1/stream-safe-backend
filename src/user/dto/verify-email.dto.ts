import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsInt, IsString } from "class-validator";

export class VerifyEmailDto{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email of the user',
    })
    @IsString()
    readonly email: string;
    @ApiProperty({
        example: true,
        description: 'true for verification and false for forget password',
    })
    @IsBoolean()
    readonly verifyOrForget: boolean;
}