import { forwardRef, Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductImage,
  ProductImageSchema,
} from './schemas/product-image.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductImage.name, schema: ProductImageSchema },
    ]),
    CloudinaryModule,
  ],
  providers: [ProductImageService],
  exports: [ProductImageService],
})
export class ProductImageModule {}
