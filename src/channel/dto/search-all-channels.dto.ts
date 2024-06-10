import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class searchAllChannelsDTO {
    @ApiProperty({
        example: "New Trends",
        description: 'Title of the channel',
    })
    @IsString()
    readonly title: string;

}
