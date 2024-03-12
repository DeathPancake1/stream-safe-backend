import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class ChangePasswordDto{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email of the user',
    })
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        example: 'password',
        description: 'new password of the user',
    })
    @IsString()
    readonly password: string;
}