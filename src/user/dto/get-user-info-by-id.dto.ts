import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsNumber, IsString } from "class-validator";

export class getUserInfoByIdDTO{
    @ApiProperty({
        example: '2',
        description: 'id of user',
    })
    @IsNumber()
    readonly id: number;
}