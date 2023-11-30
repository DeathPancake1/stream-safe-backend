import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    ValidateApiKey(apiKey: string){
        const key = process.env.API_KEY;
        return apiKey === key;
    }
}
