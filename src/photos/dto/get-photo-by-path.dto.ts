import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class GetPhotoByPathDTO {
    @ApiProperty({
        example: "storage\\images\\channels\\Maths III\\920751054d77fa515ac6c10f2b71181093d.png",
        description: 'path of photo',
    })
    @IsString()
    readonly path: string;

}
