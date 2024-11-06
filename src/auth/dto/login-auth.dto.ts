import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  password: string;
}
