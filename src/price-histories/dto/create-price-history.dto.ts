import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Product } from 'src/products/schemas/product.schema';

export class CreatePriceHistoryDto {
  @IsNotEmpty()
  @IsString()
  product: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(500)
  marketPrice: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(500)
  salePrice: number;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  valuationAt: Date;
}
