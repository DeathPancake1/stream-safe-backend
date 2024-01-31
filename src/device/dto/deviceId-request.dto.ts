import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";

export class DeviceIdDto{
    @ApiProperty({
        example: '-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2Vg2bsbHF6rJqUx+/nOdJUDp0xHTJWZOfXa7gzU1Rkc6RGr0ciCn1lLoVn/DWHh04GYlEi3V58CZ/ZqV0DC5p8HlKj3stxu3yY/vtqF/b5FrZTP0bOvBz5VDamwwkkBMKr9KDRKHP7E52gO2Yay59sYOH/nrI7dsI1g77N4ULaHxg2xym9xogSEoaO4s5eGwVr7duXGJ+K7YJfqLu66r2JQECU1GqTYnPYMCTy1wEwO/yXFBCZfMX5GdRNVbCbwVXTDpkFSzCuEY/j4C0ymv9Mlr98Y4MCpR4nlyEVAg5Gah8A/JM4bS+VPSi5OlN3gRRlFDI7cVhvOguM9nDFtvZwIDAQAB-----END PUBLIC KEY-----',
        description: 'Public key of the user',
    })
    @IsString()
    readonly publicKey: string;
}