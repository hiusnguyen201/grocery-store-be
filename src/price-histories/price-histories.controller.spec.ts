import { Test, TestingModule } from '@nestjs/testing';
import { PriceHistoriesController } from './price-histories.controller';
import { PriceHistoriesService } from './price-histories.service';

describe('PriceHistoriesController', () => {
  let controller: PriceHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceHistoriesController],
      providers: [PriceHistoriesService],
    }).compile();

    controller = module.get<PriceHistoriesController>(PriceHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
