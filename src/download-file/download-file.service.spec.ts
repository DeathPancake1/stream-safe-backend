import { Test, TestingModule } from '@nestjs/testing';
import { DownloadFileService } from './download-file.service';

describe('DownloadFileService', () => {
  let service: DownloadFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DownloadFileService],
    }).compile();

    service = module.get<DownloadFileService>(DownloadFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
