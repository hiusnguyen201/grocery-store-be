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
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { imageFileFilter, MAX_UPLOAD_FILE_SIZE } from 'src/utils/upload.util';
import { MESSAGE_SUCCESS } from 'src/constants/messages';
import { UrlInterceptor } from 'src/interceptors/url.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
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
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateInfo(id, updateUserDto);
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

  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE,
      },
      fileFilter: imageFileFilter,
    }),
  )
  async updateAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.usersService.updateAvatar(id, file);
    return {
      statusCode: HttpStatus.OK,
      message: MESSAGE_SUCCESS.UPDATE_USER_SUCCESS,
      data: user,
    };
  }
}
