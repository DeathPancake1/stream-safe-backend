import { UploadedFile } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class UploadFileDto{
    @ApiProperty({
        example: "2573bbbe-4c17-4247-a9ba-c7c2ce7b0b1c",
        description: 'Channel Id',
    })
    @IsString()
    readonly channelId: string;

    @ApiProperty({
        example: 'name',
        description: 'The name of video',
    })
    @IsString()
    readonly name: string;

    @ApiProperty({ type:'file', format:'binary' })
    file: Express.Multer.File;

    @ApiProperty({
        example: 'fkjgfdbk;dfbjfdgbWWDSGA',
        description: 'iv of the encryption',
    })
    @IsString()
    readonly iv: string;

    @ApiProperty({
        example: 'video/mp4',
        description: 'type of the file',
    })
    @IsString()
    readonly type: string;

}