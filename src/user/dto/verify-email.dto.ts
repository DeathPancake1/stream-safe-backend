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
        example: "VERIFY",
        description: 'VERIFYEMAIL for verification and FORGETPASSWORD for forget password',
    })
    @IsString()
    readonly type: string;
}