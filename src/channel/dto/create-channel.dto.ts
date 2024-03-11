import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class CreateChannelDTO{
    @ApiProperty({
        example: 'Maths III',
        description: 'Channel Title',
    })
    @IsString()
    readonly title: string;

    @ApiProperty({
        example: 'This is a channel for Maths III course',
        description: 'Channel Description',
    })
    @IsString()
    readonly description: string;

    @ApiProperty({
        example: 'true',
        description: 'Channel Privacy',
    })
    @IsBoolean()
    readonly private: boolean;
}