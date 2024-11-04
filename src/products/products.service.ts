import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { isUUID } from 'class-validator';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import responseMessage from 'src/constants/responseMessage';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...createProductDto,
    });
  }

  async findAll(name?: string): Promise<Product[]> {
    const products = await this.productModel.find();
    return products;
  }

  async findOne(identify: string): Promise<Product> {
    const filter: Partial<Product> = {};

    if (isUUID(identify)) {
      filter._id = identify;
    } else {
      filter.name = identify;
    }

    return this.productModel.findOne(filter).exec();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (!product)
      throw new NotFoundException(responseMessage.PRODUCT.PRODUCT_NOT_FOUND);

    return await this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
    });
  }

  async delete(id: string): Promise<Product> {
    const product = await this.findOne(id);

    if (!product) throw new NotFoundException('Product not found');

    return await this.productModel.findByIdAndDelete(id);
  }
}
