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
import { MESSAGE_ERROR } from 'src/constants/messages';
import { EProductStatus, PER_PAGE } from 'src/constants/common';
import { PageMetaDto } from 'src/dtos/page-meta.dto';
import { PriceHistoriesService } from 'src/price-histories/price-histories.service';
import { CreatePriceHistoryDto } from 'src/price-histories/dto/create-price-history.dto';
import { makeSlug, removeAccents } from 'src/utils/string.utils';
import regexPatterns from 'src/constants/regex-patterns';
import { ProductImageService } from 'src/product-image/product-image.service';
import { log } from 'console';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Inject(forwardRef(() => PriceHistoriesService))
    private readonly priceHistoriesService: PriceHistoriesService,
    private readonly productImageService: ProductImageService,
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
    const { name, marketPrice, salePrice, status } = createProductDto;
    try {
      session.startTransaction();

      const normalizeName = removeAccents(name);
      // New a Product Obj
      const product = await this.productModel.create({
        _id: new Types.ObjectId(),
        name,
        normalizeName,
        slug: makeSlug(normalizeName),
        status,
        hiddenAt: status === EProductStatus.INACTIVE ? new Date() : null,
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

      // Save image if have
      if (file) {
        const productImage = await this.productImageService.create(
          product._id,
          file,
        );
        product.productImage = productImage;
      }

      // Save product
      await product.save();

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
  ): Promise<{ meta: PageMetaDto; list: Product[] }> {
    const {
      page = 1,
      limit = PER_PAGE[0],
      isHidden,
      name = '',
      status,
    } = findAllProductDto;

    // Solution elastic search OR add more field normalizeName (Search without accents)
    const filterQuery: RootFilterQuery<Product> = {
      $or: [
        { name: { $regex: name, $options: 'i' } },
        { normalizeName: { $regex: name, $options: 'i' } },
      ],
      ...(status ? { status } : {}),
      ...(isHidden !== undefined
        ? { hiddenAt: isHidden ? { $ne: null } : { $eq: null } }
        : {}),
    };

    const totalCount = await this.countAll(filterQuery);

    const pageMetaDto = new PageMetaDto({ req, limit, page, totalCount });

    const products = await this.productModel
      .find(filterQuery)
      .collation({ locale: 'vi', strength: 1 })
      .skip(pageMetaDto.offset)
      .limit(pageMetaDto.limit)
      .populate({
        path: 'priceHistories',
        options: {
          sort: {
            createdAt: -1,
          },
          limit: 1,
        },
      } as PopulateOptions)
      .populate({
        path: 'productImage',
      });

    return { meta: pageMetaDto, list: products };
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
    } else if (regexPatterns.VALID_SLUG.test(id)) {
      filter.slug = id;
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
    } else if (regexPatterns.VALID_SLUG.test(id)) {
      filter.slug = id;
    } else {
      filter.name = id;
    }

    const product = await this.productModel
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
      } as PopulateOptions)
      .populate({
        path: 'productImage',
      });

    if (!product) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    return product;
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
    console.log(updateProductDto);

    if (await this.isExistName(updateProductDto.name, id)) {
      throw new BadRequestException(MESSAGE_ERROR.PRODUCT_NAME_EXIST);
    }

    const productWithLatestPrice = await this.findOneWithLatestPrice(id);
    if (!productWithLatestPrice) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    const session = await this.connection.startSession();
    const { name, marketPrice, salePrice } = updateProductDto;
    try {
      session.startTransaction();
      let normalizeName = null;
      let slug = null;
      if (updateProductDto.name) {
        normalizeName = removeAccents(updateProductDto.name);
        slug = makeSlug(normalizeName);
      }

      // Update name
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        {
          ...(updateProductDto.name ? { name, slug, normalizeName } : {}),
          ...(updateProductDto.status === EProductStatus.ACTIVE
            ? {
                hiddenAt: null,
                status: EProductStatus.ACTIVE,
              }
            : { hiddenAt: new Date(), status: EProductStatus.INACTIVE }),
        },
        { new: true },
      );

      // Check 1 of variable provided, add to price histories
      if (marketPrice || salePrice) {
        updatedProduct.priceHistories.push(
          await this.priceHistoriesService.create({
            ...(marketPrice
              ? {
                  marketPrice,
                  salePrice: productWithLatestPrice.priceHistories[0].salePrice,
                }
              : {}),
            ...(salePrice
              ? {
                  salePrice,
                  marketPrice:
                    productWithLatestPrice.priceHistories[0].marketPrice,
                }
              : {}),
            product: id,
            valuationAt: new Date(),
          } as CreatePriceHistoryDto),
        );
      }

      // Replace image if have
      if (file) {
        const productImage = await this.productImageService.findOneByProductId(
          updatedProduct._id,
        );

        // Remove current image
        await this.productImageService.removeByPublicId(productImage.publicId);

        // Create new image
        const newProductImage = await this.productImageService.create(
          updatedProduct._id,
          file,
        );

        updatedProduct.productImage = newProductImage;
      }

      await updatedProduct.save();

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
    const product = await this.findOne(id, '_id');
    if (!product) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    await this.productModel.findByIdAndUpdate(id, {
      hiddenAt: new Date(),
      status: EProductStatus.INACTIVE,
    });

    return await this.findOneWithLatestPrice(id);
  }

  /**
   * Show product
   * @param id
   * @returns
   */
  async show(id: string): Promise<Product> {
    const product = await this.findOne(id, '_id');
    if (!product) {
      throw new NotFoundException(MESSAGE_ERROR.PRODUCT_NOT_FOUND);
    }

    await this.productModel.findByIdAndUpdate(id, {
      hiddenAt: null,
      status: EProductStatus.ACTIVE,
    });

    return await this.findOneWithLatestPrice(id);
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

    const productImage = await this.productImageService.findOneByProductId(
      product._id,
    );

    if (productImage) {
      await this.productImageService.removeByPublicId(productImage.publicId);
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

    const product = await this.productModel
      .exists({
        $or: [{ name }, { slug: makeSlug(removeAccents(name)) }],
        ...extras,
      })
      .select('name');

    return !!product;
  }
}
