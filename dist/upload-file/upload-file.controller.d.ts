/// <reference types="multer" />
import { UploadFileService } from './upload-file.service';
import { SampleDto } from './sample.dto';
export declare class UploadFileController {
    private readonly uploadFileService;
    constructor(uploadFileService: UploadFileService);
    sayHello(): {
        hello: string;
    };
    uploadFile(body: SampleDto, file: Express.Multer.File): {
        body: SampleDto;
        file: string;
    };
}
