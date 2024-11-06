import { IntersectionType } from '@nestjs/mapped-types';
import { LoginAuthDto } from './login-auth.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterAuthDto extends IntersectionType(LoginAuthDto) {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  confirmPassword: string;
}
