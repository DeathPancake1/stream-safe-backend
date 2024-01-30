import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class SearchUserDto{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email of the user',
    })
    @IsString()
    readonly email: string;
}