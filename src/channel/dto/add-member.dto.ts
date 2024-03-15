import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, IsUUID } from "class-validator";

export class AddMemberDTO{
    @ApiProperty({
        example: '14bf67db-f8d9-414a-a602-9748c29d55df',
        description: 'Channel UUID',
    })
    @IsUUID()
    readonly channelId: string;

    @ApiProperty({
        example: 'user1@example.com',
        description: 'New member e-mail',
    })
    @IsString()
    readonly newMemberEmails: string;

    @ApiProperty({
        example: 'dfhajfhdalfhadsjfhdsjfhdsjkfh',
        description: 'Exchanged encrypted key',
    })
    @IsString()
    readonly key: string;
}