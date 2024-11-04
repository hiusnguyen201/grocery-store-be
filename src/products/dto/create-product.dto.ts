import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Invalid name' })
  name: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsInt({ message: 'Invalid price' })
  price: number;
}
