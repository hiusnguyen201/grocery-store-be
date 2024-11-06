import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { MESSAGE_SUCCESS } from 'src/constants/messages';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const data = await this.authService.authenticate(loginAuthDto);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.LOGIN_SUCCESS,
      data,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    const data = await this.authService.register(registerAuthDto);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.REGISTER_SUCCESS,
      data,
    };
  }
}
