import { Transform } from 'class-transformer';
import { IsString, IsOptional, Min, IsInt, IsIn } from 'class-validator';
import { EUserStatuses, PER_PAGE } from 'src/constants/common';

export class FindAllUserDto {
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
  query?: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EUserStatuses))
  status: EUserStatuses;
}
