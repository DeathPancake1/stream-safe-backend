import {
    Body,
    Controller,
    Get,
    ParseFilePipeBuilder,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { Express } from 'express';
  import { UploadFileService } from './upload-file.service';
  import { SampleDto } from './sample.dto';
  
  @Controller('upload-file')
  export class UploadFileController {
    constructor(private readonly uploadFileService: UploadFileService) {}
  
    @Get()
    sayHello() {
      return this.uploadFileService.getHello();
    }
  
    @UseInterceptors(FileInterceptor('file'))
    @Post('file')
    uploadFile(
      @Body() body: SampleDto,
      @UploadedFile() file: Express.Multer.File,
    ) {
      return {
        body,
        file: file.buffer.toString(),
      };
    }
  }