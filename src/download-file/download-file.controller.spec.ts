import { Test, TestingModule } from '@nestjs/testing';
import { DownloadFileController } from './download-file.controller';

describe('DownloadFileController', () => {
  let controller: DownloadFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DownloadFileController],
    }).compile();

    controller = module.get<DownloadFileController>(DownloadFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
