import { forwardRef, Module } from '@nestjs/common';
import { PriceHistoriesService } from './price-histories.service';
import { PriceHistoriesController } from './price-histories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PriceHistory,
  PriceHistorySchema,
} from './schemas/price-history.schema';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PriceHistory.name, schema: PriceHistorySchema },
    ]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [PriceHistoriesController],
  providers: [PriceHistoriesService],
  exports: [PriceHistoriesService],
})
export class PriceHistoriesModule {}
