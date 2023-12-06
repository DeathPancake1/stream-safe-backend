import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class FindUserDto{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email of the user',
    })
    @IsEmail()
    readonly email: string;
}