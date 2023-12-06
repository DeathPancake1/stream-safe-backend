import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class LoginUserDto{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Lastname of the user',
    })
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        example: 'password',
        description: 'password of the user',
    })
    @IsString()
    readonly password: string;
}