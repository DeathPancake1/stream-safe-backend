import { Test, TestingModule } from '@nestjs/testing';
import { ChannelFilesService } from './channel-files.service';

describe('ChannelFilesService', () => {
  let service: ChannelFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelFilesService],
    }).compile();

    service = module.get<ChannelFilesService>(ChannelFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
