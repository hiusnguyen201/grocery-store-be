import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop()
  _id: string;

  @Prop({ type: String, required: true, maxLength: 200, unique: true })
  name: string;

  @Prop({ type: String, maxLength: 400 })
  image: string;

  @Prop({ type: String, required: true, min: 500 }) // 500 vnd
  price: number;

  @Prop({ type: Date, default: null })
  hiddenAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
