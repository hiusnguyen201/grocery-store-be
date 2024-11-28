import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ProductImage } from './schemas/product-image.schema';
import {
  CloudinaryService,
  CROP_IMAGE_OPTIONS,
  UploadBufferFile,
} from 'src/cloudinary/cloudinary.service';
import { v4 as uuidv4 } from 'uuid';
import { insertValToArr } from 'src/utils/string.utils';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectModel(ProductImage.name)
    private productImageModel: Model<ProductImage>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findOneByProductId(productId: string) {
    return await this.productImageModel.findOne({
      product: productId,
    });
  }

  async create(
    productId: string,
    file: Express.Multer.File,
  ): Promise<ProductImage> {
    const JOB_UPLOAD_IMAGE = 'UPLOAD_PRODUCT_IMAGE';
    const fileName = `${uuidv4()}-${new Date().getTime()}`;
    const uploadInfo: UploadBufferFile = {
      file: file.buffer,
      folder: `products/${productId}`,
      fileName,
      resourceType: 'image',
    };

    const result = await this.cloudinaryService.uploadBuffer(
      JOB_UPLOAD_IMAGE,
      uploadInfo,
    );

    const segments = result.url.split('/');
    const indexInsertOptions = segments.indexOf(`v${result.version}`);

    return await this.productImageModel.create({
      _id: new Types.ObjectId(),
      product: productId,
      publicId: result.public_id,
      bytes: result.bytes,
      displayName: fileName,
      format: result.format,
      originalPath: result.url,
      mediumPath: insertValToArr(
        segments,
        CROP_IMAGE_OPTIONS.MEDIUM,
        indexInsertOptions,
      ).join('/'),
      smallPath: insertValToArr(
        segments,
        CROP_IMAGE_OPTIONS.SMALL,
        indexInsertOptions,
      ).join('/'),
    });
  }

  async removeByPublicId(publicId: string) {
    const productImage = await this.productImageModel.findOne({
      publicId,
    });

    const JOB_DELETE_IMAGE = 'DELETE_PRODUCT_IMAGE';
    await this.cloudinaryService.removeFile(
      JOB_DELETE_IMAGE,
      productImage.publicId,
    );

    return await this.productImageModel.findByIdAndDelete(productImage._id);
  }
}
