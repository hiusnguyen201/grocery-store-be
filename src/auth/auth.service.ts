import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/schemas/user.schema';
import { compareHash } from 'src/utils/bcrypt.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async authenticate(
    loginAuthDto: LoginAuthDto,
  ): Promise<{ accessToken: string; user: User }> {
    const user: User = await this.usersService.findOne(
      loginAuthDto.email,
      'password',
    );

    if (!user || !(await compareHash(loginAuthDto.password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { _id: user._id };
    const accessToken: string = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt.expiryTime'),
    });

    return { accessToken, user: await this.usersService.findOne(user._id) };
  }

  async registerUser(
    registerAuthDto: RegisterAuthDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    return await this.usersService.register(registerAuthDto, file);
  }
}
