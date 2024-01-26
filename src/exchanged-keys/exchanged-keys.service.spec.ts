import { Test, TestingModule } from '@nestjs/testing';
import { ExchangedKeysService } from './exchanged-keys.service';

describe('ExchangedKeysService', () => {
  let service: ExchangedKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangedKeysService],
    }).compile();

    service = module.get<ExchangedKeysService>(ExchangedKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
