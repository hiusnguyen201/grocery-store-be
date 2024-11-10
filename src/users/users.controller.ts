import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { configUploadImage } from 'src/utils/upload.util';
import { MESSAGE_SUCCESS } from 'src/constants/messages';
import { UrlInterceptor } from 'src/interceptors/url.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(configUploadImage('avatar'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.usersService.create(createUserDto, file);
    return {
      statusCode: HttpStatus.CREATED,
      message: MESSAGE_SUCCESS.CREATE_USER_SUCCESS,
      data: user,
    };
  }

  @Get()
  @UseInterceptors(UrlInterceptor)
  async findAll(@Req() req: Request, @Query() query: FindAllUserDto) {
    const data = await this.usersService.findAll(req, query);

    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.GET_ALL_USERS_SUCCESS,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.GET_USER_SUCCESS,
      data: user,
    };
  }

  @Patch(':id')
  @UseInterceptors(configUploadImage('avatar'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.usersService.update(id, updateUserDto, file);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.UPDATE_USER_SUCCESS,
      data: user,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.usersService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.REMOVE_USER_SUCCESS,
      data: user,
    };
  }
}
