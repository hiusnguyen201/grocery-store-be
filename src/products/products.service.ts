import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import mongoose, {
  FilterQuery,
  isValidObjectId,
  Model,
  RootFilterQuery,
} from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductDto } from './dto/find-all-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import {
  CloudinaryService,
  UploadBufferFile,
} from 'src/cloudinary/cloudinary.service';
import { MESSAGE_ERROR } from 'src/constants/messages';
import { PER_PAGE } from 'src/constants/common';
import { PageMetaDto } from 'src/dtos/page-meta.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Create product
   * @param createProductDto
   * @param file
   * @returns
   */
  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    if (await this.isExistName(createProductDto.name)) {
      throw new BadRequestException(MESSAGE_ERROR.PRODUCT_NAME_EXIST);
    }

    const product = await this.productModel.create({
      _id: new mongoose.Types.ObjectId(),
      createProductDto,
    });

    if (file) {
      this.saveImage(product, file);
    }

    return product;
  }

  /**
   * Find all products
   * @param req
   * @param query
   * @returns
   */
  async findAll(
    req: Request,
    query: FindAllProductDto,
  ): Promise<{ meta: PageMetaDto; products: Product[] }> {
    const {
      page = 1,
      limit = PER_PAGE[0],
      keyword = '',
      isHidden = false,
    } = query;

    const filterQuery: RootFilterQuery<Product> = {
      name: keyword,
      hiddenAt: isHidden ? { $ne: null } : { $eq: null },
    };

    const totalCount = await this.countAll(filterQuery);

    const pageMetaDto = new PageMetaDto({ req, limit, page, totalCount });

    const products = await this.productModel
      .find(filterQuery)
      .skip(pageMetaDto.offset)
      .limit(limit);

    return { meta: pageMetaDto, products };
  }

  /**
   * Find product
   * @param id
   * @param selectFields
   * @returns
   */
  async findOne(id: string, selectFields?: string): Promise<Product> {
    const filter: Partial<Product> = {};

    if (isValidObjectId(id)) {
      filter._id = id;
    } else {
      filter.name = id;
    }

    return await this.productModel.findOne(filter).select(selectFields);
  }

  /**
   * Update product
   * @param id
   * @param updateProductDto
   * @param file
   * @returns
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    if (await this.isExistName(updateProductDto.name, id)) {
      throw new BadRequestException(MESSAGE_ERROR.PRODUCT_NAME_EXIST);
    }

    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    if (file) {
      this.saveImage(product, file);
    }

    return await this.productModel.findByIdAndUpdate(
      product._id,
      updateProductDto,
      { new: true },
    );
  }

  /**
   * Remove product
   * @param id
   * @returns
   */
  async remove(id: string): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    return await this.productModel.findByIdAndDelete(id);
  }

  /**
   * Count all products
   * @param filterQuery
   * @returns
   */
  async countAll(filterQuery: FilterQuery<Product>): Promise<number> {
    return await this.productModel.countDocuments(filterQuery);
  }

  /**
   * Check exist product name
   * @param name
   * @param skipId
   * @returns
   */
  async isExistName(name: string, skipId?: string): Promise<boolean> {
    const extras: any = {};
    if (skipId) {
      extras._id = {
        $ne: skipId,
      };
    }

    const product = await this.productModel.exists({
      name,
      ...extras,
    });

    return !!product;
  }

  private async saveImage(
    product: Product,
    file: Express.Multer.File,
  ): Promise<void> {
    const JOB_NAME = 'UPLOAD_PRODUCT_IMAGE';
    const uploadInfo: UploadBufferFile = {
      file: file.buffer,
      folder: `products/${product._id}`,
      fileName: `${file.originalname}-${new Date().getTime()}`,
      resourceType: 'image',
    };

    this.cloudinaryService
      .uploadBuffer(JOB_NAME, uploadInfo)
      .then(async (result) => {
        await this.productModel.findByIdAndUpdate(product._id, {
          image: result.url,
        });
      })
      .catch((err) => {
        // Send error
      });
  }
}
