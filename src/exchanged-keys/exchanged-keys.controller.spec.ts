import { Test, TestingModule } from '@nestjs/testing';
import { ExchangedKeysController } from './exchanged-keys.controller';

describe('ExchangedKeysController', () => {
  let controller: ExchangedKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangedKeysController],
    }).compile();

    controller = module.get<ExchangedKeysController>(ExchangedKeysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
