import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateChannelDTO {
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
        example: 'true', // Accepts string 'true' or 'false'
        description: 'Channel Privacy',
    })
    @IsString()
    readonly private: string;

    @ApiProperty({ type: 'file', format: 'binary' })
    thumbnailPhoto: Express.Multer.File;
}
