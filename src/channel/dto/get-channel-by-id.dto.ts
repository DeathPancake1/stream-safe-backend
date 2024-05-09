import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class getChannelByIdDTO {
    @ApiProperty({
        example: "b1b3a733-f632-4463-94a5-4211078d8566",
        description: 'Id of the channel',
    })
    @IsString()
    readonly id: string;

}
