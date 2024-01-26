import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class CheckExchangedDTO{
    @ApiProperty({
        example: 'john@example.com',
        description: 'Email of the reciever',
    })
    @IsEmail()
    readonly email: string;

}