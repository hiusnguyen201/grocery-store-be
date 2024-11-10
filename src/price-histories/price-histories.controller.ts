import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PriceHistoriesService } from './price-histories.service';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { UpdatePriceHistoryDto } from './dto/update-price-history.dto';

@Controller('price-histories')
export class PriceHistoriesController {
  constructor(private readonly priceHistoriesService: PriceHistoriesService) {}

  @Post()
  create(@Body() createPriceHistoryDto: CreatePriceHistoryDto) {
    return this.priceHistoriesService.create(createPriceHistoryDto);
  }

  @Get()
  findAll() {
    return this.priceHistoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceHistoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePriceHistoryDto: UpdatePriceHistoryDto,
  ) {
    return this.priceHistoriesService.update(id, updatePriceHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceHistoriesService.remove(id);
  }
}
