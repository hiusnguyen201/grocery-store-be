import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    return { data: product };
  }

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('status') status?: 'OUT_OF_STOCK' | 'IN_STOCK',
  ) {
    const products = await this.productService.findAll();
    return { data: products };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return { data: product };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productService.update(id, updateProductDto);
    return { data: product };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const product = await this.productService.delete(id);
    return { data: product };
  }
}
