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
    @IsStrongPassword()
    readonly password: string;

    @ApiProperty({
        example: 'fhasjkfhdaj',
        description: 'Lastname of the user',
    })
    @IsString()
    readonly publicKey: string;

    @ApiProperty({
        example: 'fdlkasjfdalskj',
        description: 'Lastname of the user',
    })
    @IsString()
    readonly deviceId: string;

    @IsInt()
    readonly photoId?: number;
}