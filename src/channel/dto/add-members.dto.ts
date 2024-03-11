import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, IsUUID } from "class-validator";

export class AddMembersDTO{
    @ApiProperty({
        example: '14bf67db-f8d9-414a-a602-9748c29d55df',
        description: 'Channel UUID',
    })
    @IsUUID()
    readonly channelId: string;

    @ApiProperty({
        example: [
            'user1@example.com',
            'user2@example.com'
        ],
        description: 'New member e-mails',
    })
    @IsArray()
    readonly newMemberEmails: string[];
}