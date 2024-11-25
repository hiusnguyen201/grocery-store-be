import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  Min,
  IsInt,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { EProductStatus, PER_PAGE } from 'src/constants/common';
import { removeAccents } from 'src/utils/string.utils';

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
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @Transform(({ value }) => removeAccents(value))
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => removeAccents(value))
  @IsIn(Object.values(EProductStatus))
  status?: string;
}
