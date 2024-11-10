import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductDto } from './dto/find-all-product.dto';
import { MESSAGE_SUCCESS } from 'src/constants/messages';
import { UrlInterceptor } from 'src/interceptors/url.interceptor';
import { configUploadImage } from 'src/utils/upload.util';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(configUploadImage('image'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.productsService.create(createProductDto, file);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGE_SUCCESS.CREATE_PRODUCT_SUCCESS,
      data,
    };
  }

  @Get()
  @UseInterceptors(UrlInterceptor)
  async findAll(@Req() req: Request, @Query() query: FindAllProductDto) {
    const data = await this.productsService.findAllWithLatestPrice(req, query);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.GET_ALL_PRODUCTS_SUCCESS,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOneWithLatestPrice(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.GET_PRODUCT_SUCCESS,
      data: product,
    };
  }

  @Patch(':id')
  @UseInterceptors(configUploadImage('image'))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const product = await this.productsService.update(
      id,
      updateProductDto,
      file,
    );
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.UPDATE_USER_SUCCESS,
      data: product,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const product = await this.productsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.REMOVE_PRODUCT_SUCCESS,
      data: product,
    };
  }

  @Patch(':id/hide')
  async hide(@Param('id') id: string) {
    const product = await this.productsService.hide(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.HIDE_PRODUCT_SUCCESS,
      data: product,
    };
  }

  @Patch(':id/show')
  async show(@Param('id') id: string) {
    const product = await this.productsService.show(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.SHOW_PRODUCT_SUCCESS,
      data: product,
    };
  }

  @Get(':id/prices')
  async getAllPrices(@Param('id') id: string) {
    const product = await this.productsService.getAllPrices(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.GET_PRODUCT_SUCCESS,
      data: product,
    };
  }
}
