import { Test, TestingModule } from '@nestjs/testing';
import { ChannelRequestService } from './channel-request.service';

describe('ChannelRequestService', () => {
  let service: ChannelRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelRequestService],
    }).compile();

    service = module.get<ChannelRequestService>(ChannelRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
