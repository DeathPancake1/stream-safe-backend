import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsString, IsUUID } from "class-validator";

export class GetMembersDTO{
    @ApiProperty({
        example: '14bf67db-f8d9-414a-a602-9748c29d55df',
        description: 'Channel UUID',
    })
    @IsUUID()
    readonly channelId: string;
}

export class GetMembersReturnDTO{
    @ApiProperty({
        example: '1',
        description: 'Total Members',
    })
    @IsInt()
    readonly totalMembers: number;

    @ApiProperty({
        example: `
            [
                "test@example.com"
            ]
        `,
        description: 'List of Members',
    })
    @IsArray()
    readonly subscribers: {
        email: string
    }[];
}