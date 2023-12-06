import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    ValidateApiKey(apiKey: string){
        const key = process.env.API_KEY;
        return apiKey === key;
    }

    async validateUser(userData: LoginUserDto): Promise<User | null> {
        const user = await this.userService.user(userData);
        return user
    }
    
    async login(userData: LoginUserDto): Promise<{ accessToken: string } | null> {
        const payload = { sub: userData.email };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

}
