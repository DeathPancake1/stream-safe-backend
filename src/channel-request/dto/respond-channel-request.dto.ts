import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class RespondChannelRequestDto{
    @ApiProperty({
        example: 5,
        description: 'Request Id',
    })
    @IsInt()
    readonly requestId: number;

    @ApiProperty({
        example: "true",
        description: 'true means accept, false means reject',
    })
    @IsString()
    readonly response: string;

    @ApiProperty({
        example: 'dfhajfhdalfhadsjfhdsjfhdsjkfh',
        description: 'Exchanged encrypted key',
    })
    @IsString()
    readonly key: string;
}