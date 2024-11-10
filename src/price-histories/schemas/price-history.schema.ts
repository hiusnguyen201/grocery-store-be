import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, now } from 'mongoose';
import { Product } from 'src/products/schemas/product.schema';

export type PriceHistoryDocument = HydratedDocument<PriceHistory>;

@Schema({ timestamps: true, versionKey: false })
export class PriceHistory {
  @Prop()
  _id: string;

  @Prop({ type: mongoose.Schema.ObjectId, required: true, ref: 'Product' })
  product: Product;

  @Prop({ type: String, required: true, min: 500 })
  marketPrice: number;

  @Prop({ type: String, required: true, min: 500 })
  salePrice: number;

  @Prop({ type: Date, required: true, default: now() })
  valuationAt: Date;
}

export const PriceHistorySchema = SchemaFactory.createForClass(PriceHistory);
