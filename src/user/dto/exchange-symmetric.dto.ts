import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class ExchangeSymmetricDto{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email of the user2',
    })
    @IsEmail()
    readonly email: string;
    @ApiProperty({
        example: 'abbkjal@@#@#@GLHGUEYLDbvhldslvg@ijifg',
        description: 'The symmetric key',
    })
    @IsString()
    readonly key: string;
}