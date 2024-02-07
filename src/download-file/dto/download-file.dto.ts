import { UploadedFile } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class DownloadFileDto{
    @ApiProperty({
        example: "storage\\videos\\amged@gmail.com_adam@gmail.com\\67104ad58e01e186d5dc104eae0368102ce.txt",
        description: 'path of video needed ',
    })
    @IsString()
    readonly path: string;
}