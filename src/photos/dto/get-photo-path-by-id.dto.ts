import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class GetPhotoPathByIdDTO {
    @ApiProperty({
        example: "22",
        description: 'Id of the photo',
    })
    @IsNumber()
    readonly id: number;

}
