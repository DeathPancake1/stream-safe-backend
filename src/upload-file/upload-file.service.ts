import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadFileService {
    getHello() {
        return { hello: 'world' };
    }
}
