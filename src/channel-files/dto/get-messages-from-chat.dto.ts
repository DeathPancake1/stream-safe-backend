import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class GetMessagesFromChatDto{
    @ApiProperty({
        example: "2573bbbe-4c17-4247-a9ba-c7c2ce7b0b1c",
        description: 'The channelId',
    })
    @IsString()
    readonly channelId: string;
}