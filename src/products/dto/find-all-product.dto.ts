import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  Min,
  IsInt,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { PER_PAGE } from 'src/constants/common';

export class FindAllProductDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsIn(PER_PAGE)
  limit?: number;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  isHidden?: boolean;
}
