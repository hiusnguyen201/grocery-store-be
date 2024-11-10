import { Test, TestingModule } from '@nestjs/testing';
import { PriceHistoriesService } from './price-histories.service';

describe('PriceHistoriesService', () => {
  let service: PriceHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceHistoriesService],
    }).compile();

    service = module.get<PriceHistoriesService>(PriceHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
