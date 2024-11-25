import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EProductStatus } from 'src/constants/common';
import { PriceHistory } from 'src/price-histories/schemas/price-history.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop()
  _id: string;

  @Prop({
    type: String,
    required: true,
    maxLength: 255,
    unique: true,
    index: true,
  })
  slug: string;

  @Prop({
    type: String,
    required: true,
    maxLength: 200,
    unique: true,
    index: true,
  })
  name: string;

  @Prop({
    type: String,
    maxLength: 200,
  })
  normalizeName: string;

  @Prop({ type: String, required: true, default: EProductStatus.ACTIVE })
  status: EProductStatus;

  @Prop({ type: String, maxLength: 300 })
  image: string;

  @Prop({ type: [{ type: mongoose.Schema.ObjectId, ref: 'PriceHistory' }] })
  priceHistories: PriceHistory[];

  @Prop({ type: Date, default: null })
  hiddenAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
