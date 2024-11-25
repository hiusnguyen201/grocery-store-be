import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EProductStatus } from 'src/constants/common';
import { replaceAllSpacesToSpace } from 'src/utils/string.utils';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => replaceAllSpacesToSpace(value))
  name: string;

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
  @IsIn(Object.values(EProductStatus))
  status: string;
}
