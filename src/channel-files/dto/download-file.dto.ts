import { UploadedFile } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class DownloadFileDto{
    @ApiProperty({
        example: "storage\\videos\\2573bbbe-4c17-4247-a9ba-c7c2ce7b0b1c\\67104ad58e01e186d5dc104eae0368102ce.enc",
        description: 'path of video needed ',
    })
    @IsString()
    readonly path: string;
}