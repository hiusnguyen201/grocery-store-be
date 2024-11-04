import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsIn,
} from 'class-validator';

import { EUserRoles } from 'src/constants/common';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(EUserRoles))
  role: EUserRoles;
}
