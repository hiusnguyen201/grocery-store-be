import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail, isUUID } from 'class-validator';
import mongoose, { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { MESSAGE_ERROR } from 'src/constants/messages';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { makeHash } from 'src/utils/bcrypt.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto, file: Express.Multer.File) {
    if (await this.findOne(createUserDto.email)) {
      throw new BadRequestException(MESSAGE_ERROR.USER.EMAIL_EXIST);
    }

    const hashedPassword = await makeHash(createUserDto.password);
    const newUser = await this.userModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...createUserDto,
      password: hashedPassword,
    });

    if (file) {
      const fileName = `${file.originalname}-${new Date().getTime()}`;
      this.cloudinaryService
        .uploadImageBuffer(file.buffer, `avatars/${newUser._id}`, fileName)
        .then(async (result) => {
          newUser.avatar = result.url;
          newUser.save();
        });
    }

    // Return user without password
    return await this.findOne(newUser._id);
  }

  async findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    const filter: Partial<User> = {};

    if (isUUID(id)) {
      filter._id = id;
    } else if (isEmail(id)) {
      filter.email = id;
    } else {
      return null;
    }

    return await this.userModel.findOne(filter).select('-password');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
