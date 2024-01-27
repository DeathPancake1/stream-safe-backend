import { UploadedFile } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class uploadFileDto{
    @ApiProperty({
        example: "john1@example.com",
        description: 'email of sender ',
    })
    @IsEmail()
    readonly senderEmail: string;
    @ApiProperty({
        example: "john2@example.com",
        description: 'email of receiver ',
    })
    @IsEmail()
    readonly receiverEmail: string;
    @ApiProperty({
        example: 'name',
        description: 'The name of video',
    })
    @IsString()
    readonly name: string;
    @ApiProperty({ type:'string', format:'binary' })
    file: Express.Multer.File;
}