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
    const product = await this.productsService.create(createProductDto, file);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGE_SUCCESS.CREATE_PRODUCT_SUCCESS,
      data: product,
    };
  }

  @Get()
  @UseInterceptors(UrlInterceptor)
  async findAll(@Req() req: Request, @Query() query: FindAllProductDto) {
    const data = await this.productsService.findAll(req, query);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.GET_ALL_PRODUCTS_SUCCESS,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
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
}
