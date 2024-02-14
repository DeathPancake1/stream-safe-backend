import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class GetMessagesFromChatDto{
    @ApiProperty({
        example: "john1@example.com",
        description: 'email of the other user ',
    })
    @IsEmail()
    readonly email: string;
}