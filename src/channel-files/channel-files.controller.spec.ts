import { Test, TestingModule } from '@nestjs/testing';
import { ChannelFilesController } from './channel-files.controller';

describe('ChannelFilesController', () => {
  let controller: ChannelFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelFilesController],
    }).compile();

    controller = module.get<ChannelFilesController>(ChannelFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
