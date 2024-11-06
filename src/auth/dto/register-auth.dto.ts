import { IntersectionType } from '@nestjs/mapped-types';
import { LoginAuthDto } from './login-auth.dto';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { Match } from 'src/decorators/match.decorator';

export class RegisterAuthDto extends IntersectionType(LoginAuthDto) {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Match('password')
  confirmPassword: string;
}
