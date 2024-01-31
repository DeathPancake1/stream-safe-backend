import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto{
    @ApiProperty({
        example: 'john',
        description: 'Firstname of the user',
    })
    @IsString()
    readonly firstname: string;

    @ApiProperty({
        example: 'john',
        description: 'Lastname of the user',
    })
    @IsString()
    readonly lastname: string;

    @ApiProperty({
        example: 'john@example.com',
        description: 'Lastname of the user',
    })
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        example: 'password',
        description: 'Password of the user',
    })
    @IsString()
    readonly password: string;
}