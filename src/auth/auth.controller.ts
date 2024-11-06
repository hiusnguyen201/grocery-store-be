import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { MESSAGE_SUCCESS } from 'src/constants/messages';
import { imageFileFilter, MAX_UPLOAD_FILE_SIZE } from 'src/utils/upload.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const data = await this.authService.authenticate(loginAuthDto);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.LOGIN_SUCCESS,
      data,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE,
      },
      fileFilter: imageFileFilter,
    }),
  )
  async register(
    @Body() registerAuthDto: RegisterAuthDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.authService.registerUser(registerAuthDto, file);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.REGISTER_SUCCESS,
      data: user,
    };
  }
}
