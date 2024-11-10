import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  FilterQuery,
  isValidObjectId,
  Model,
  RootFilterQuery,
  Connection,
  Types,
  PopulateOptions,
} from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductDto } from './dto/find-all-product.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import {
  CloudinaryService,
  UploadBufferFile,
} from 'src/cloudinary/cloudinary.service';
import { MESSAGE_ERROR } from 'src/constants/messages';
import { PER_PAGE } from 'src/constants/common';
import { PageMetaDto } from 'src/dtos/page-meta.dto';
import { PriceHistoriesService } from 'src/price-histories/price-histories.service';
import { CreatePriceHistoryDto } from 'src/price-histories/dto/create-price-history.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Inject(forwardRef(() => PriceHistoriesService))
    private readonly priceHistoriesService: PriceHistoriesService,
    private readonly cloudinaryService: CloudinaryService,
    @InjectConnection() private readonly connection: Connection,
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

    const session = await this.connection.startSession();
    const { name, marketPrice, salePrice } = createProductDto;
    try {
      session.startTransaction();

      // New a Product Obj
      const product = await this.productModel.create({
        _id: new Types.ObjectId(),
        name,
      });

      // Add price to price history
      product.priceHistories.push(
        await this.priceHistoriesService.create({
          marketPrice,
          salePrice,
          product: product._id,
          valuationAt: new Date(),
        } as CreatePriceHistoryDto),
      );

      // Save product
      await product.save();

      // Save image if have
      if (file) {
        this.saveImage(product, file);
      }

      await session.commitTransaction();
      return product;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Find all products with latest price
   * @param req
   * @param query
   * @returns
   */
  async findAllWithLatestPrice(
    req: Request,
    findAllProductDto: FindAllProductDto,
  ): Promise<{ meta: PageMetaDto; products: Product[] }> {
    const {
      page = 1,
      limit = PER_PAGE[0],
      query = '',
      isHidden = false,
    } = findAllProductDto;

    const filterQuery: RootFilterQuery<Product> = {
      name: { $regex: query, $options: 'i' },
      hiddenAt: isHidden ? { $ne: null } : { $eq: null },
    };

    const totalCount = await this.countAll(filterQuery);

    const pageMetaDto = new PageMetaDto({ req, limit, page, totalCount });

    const products = await this.productModel
      .find(filterQuery)
      .skip(pageMetaDto.offset)
      .limit(limit)
      .populate({
        path: 'priceHistories',
        options: {
          sort: {
            createdAt: -1,
          },
          limit: 1,
        },
      } as PopulateOptions);

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
   *Find product with latest price
   * @param id
   * @param selectFields
   * @returns
   */
  async findOneWithLatestPrice(
    id: string,
    selectFields?: string,
  ): Promise<Product> {
    const filter: Partial<Product> = {};

    if (isValidObjectId(id)) {
      filter._id = id;
    } else {
      filter.name = id;
    }

    return await this.productModel
      .findOne(filter)
      .select(selectFields)
      .populate({
        path: 'priceHistories',
        options: {
          sort: {
            createdAt: -1,
          },
          limit: 1,
        },
      } as PopulateOptions);
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

    if (!(await this.findOne(id))) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    const session = await this.connection.startSession();
    const { name, marketPrice, salePrice } = updateProductDto;
    try {
      session.startTransaction();

      // Update product
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        {
          name,
        },
        { new: true },
      );

      // Check 1 of variable provided, add to price histories
      if (marketPrice && salePrice) {
        updatedProduct.priceHistories.push(
          await this.priceHistoriesService.create({
            marketPrice,
            salePrice,
            product: id,
            valuationAt: new Date(),
          } as CreatePriceHistoryDto),
        );
      }

      await updatedProduct.save();

      // Save image if have
      if (file) {
        this.saveImage(updatedProduct, file);
      }

      await session.commitTransaction();
      return updatedProduct;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Hide product
   * @param id
   * @returns
   */
  async hide(id: string): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    return await this.productModel.findByIdAndUpdate(
      id,
      {
        hiddenAt: new Date(),
      },
      { new: true },
    );
  }

  /**
   * Show product
   * @param id
   * @returns
   */
  async show(id: string): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    return await this.productModel.findByIdAndUpdate(
      id,
      {
        hiddenAt: null,
      },
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
   * Get all prices
   * @param id
   * @returns
   */
  async getAllPrices(id: string): Promise<Product> {
    if (!(await this.findOne(id))) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    return await this.productModel.findById(id).populate({
      path: 'priceHistories',
    } as PopulateOptions);
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

  /**
   * Save product image
   * @param product
   * @param file
   */
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
