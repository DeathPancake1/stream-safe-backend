import { Test, TestingModule } from '@nestjs/testing';
import { ChannelRequestController } from './channel-request.controller';

describe('ChannelRequestController', () => {
  let controller: ChannelRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelRequestController],
    }).compile();

    controller = module.get<ChannelRequestController>(ChannelRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
