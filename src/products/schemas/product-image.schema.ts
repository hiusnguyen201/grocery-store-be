import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from './product.schema';

export type ProductImageDocument = HydratedDocument<ProductImage>;

@Schema({ timestamps: true, versionKey: false })
export class ProductImage {
  @Prop()
  _id: string;

  @Prop({ type: mongoose.Schema.ObjectId, required: true, ref: 'Product' })
  product: Product;

  @Prop({
    type: String,
    required: true,
    maxLength: 300,
  })
  originalPath: string;

  @Prop({
    type: String,
    required: true,
    maxLength: 300,
  })
  mediumPath: string;

  @Prop({
    type: String,
    required: true,
    maxLength: 300,
  })
  smallPath: string;

  @Prop({
    type: String,
    required: true,
    maxLength: 200,
  })
  displayName: string;

  @Prop({
    type: Number,
    required: true,
  })
  bytes: number;

  @Prop({
    type: String,
    required: true,
  })
  format: string;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);
