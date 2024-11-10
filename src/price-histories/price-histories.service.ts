import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { UpdatePriceHistoryDto } from './dto/update-price-history.dto';
import { PriceHistory } from './schemas/price-history.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProductsService } from 'src/products/products.service';
import { MESSAGE_ERROR } from 'src/constants/messages';

@Injectable()
export class PriceHistoriesService {
  constructor(
    @InjectModel(PriceHistory.name)
    private priceHistoryModel: Model<PriceHistory>,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
  ) {}

  async create(
    createPriceHistoryDto: CreatePriceHistoryDto,
  ): Promise<PriceHistory> {
    if (!(await this.productsService.findOne(createPriceHistoryDto.product))) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    return this.priceHistoryModel.create({
      _id: new Types.ObjectId(),
      ...createPriceHistoryDto,
    });
  }

  async findAll(): Promise<PriceHistory[]> {
    return await this.priceHistoryModel.find();
  }

  async findOne(id: string): Promise<PriceHistory> {
    return await this.priceHistoryModel.findById(id);
  }

  async update(id: string, updatePriceHistoryDto: UpdatePriceHistoryDto) {
    if (await this.findOne(id)) {
      throw new NotFoundException(MESSAGE_ERROR.PRICE_HISTORY_NOT_FOUND);
    }

    return await this.priceHistoryModel.findByIdAndUpdate(
      id,
      updatePriceHistoryDto,
    );
  }

  async remove(id: string) {
    if (await this.findOne(id)) {
      throw new NotFoundException(MESSAGE_ERROR.PRICE_HISTORY_NOT_FOUND);
    }

    return await this.priceHistoryModel.findByIdAndDelete(id);
  }
}
