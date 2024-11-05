import { IsString, IsNumberString, IsOptional } from 'class-validator';

export class FindAllUserDto {
  @IsOptional()
  @IsNumberString()
  page: number;

  @IsOptional()
  @IsNumberString()
  limit: number;

  @IsOptional()
  @IsString()
  keyword: string;
}
