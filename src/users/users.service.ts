import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';
import mongoose, { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { MESSAGE_ERROR } from 'src/constants/messages';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { makeHash } from 'src/utils/bcrypt';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { EUserRoles } from 'src/constants/common';
import { isValidObjectId } from 'src/utils/validation';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Create user
   * @param createUserDto
   * @param file
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    if (await this.isExistEmail(createUserDto.email)) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const hashedPassword = await makeHash(createUserDto.password);
    const newUser = await this.userModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...createUserDto,
      password: hashedPassword,
    });

    // Return user without password
    return await this.findOne(newUser._id);
  }

  /**
   * Count all user
   * @param role
   * @returns
   */
  async countAll(role?: EUserRoles) {
    return await this.userModel.countDocuments({
      role,
    });
  }

  /**
   * Find all user
   * @param queryString
   * @returns
   */
  async findAll(queryString: FindAllUserDto) {
    const { page = 1, limit = 10, keyword = '' } = queryString;

    const totalCount = await this.countAll();
    const totalPage = Math.ceil(totalCount / +limit);
    const offset = (+page - 1) * +limit;

    const users = await this.userModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } }, // Option "i" - Search lowercase and uppercase
          { email: { $regex: keyword, $options: 'i' } },
        ],
      })
      .skip(offset)
      .limit(+limit)
      .select('-password');

    return {
      users,
      meta: {
        page,
        offset,
        limit,
        totalPage,
        totalCount,
        isNext: +page < totalPage,
        isPrevious: +page > 1,
      },
    };
  }

  /**
   * Find user
   * @param id
   * @returns
   */
  async findOne(id: string) {
    const filter: Partial<User> = {};

    if (isValidObjectId(id)) {
      filter._id = id;
    } else if (isEmail(id)) {
      filter.email = id;
    } else {
      return null;
    }

    return await this.userModel.findOne(filter).select('-password');
  }

  /**
   * Update info user
   * @param id
   * @param updateUserDto
   * @returns
   */
  async updateInfo(id: string, updateUserDto: UpdateUserDto) {
    if (await this.isExistEmail(updateUserDto.email, id)) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    return await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }

  /**
   * Update avatar user
   * @param id
   * @param file
   */
  async updateAvatar(id: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(MESSAGE_ERROR.FILE_NOT_FOUND);
    }

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const fileName = `${file.originalname}-${new Date().getTime()}`;
    const result = await this.cloudinaryService.uploadImageBuffer(
      file.buffer,
      `avatars/${user._id}`,
      fileName,
    );
    user.avatar = result.url;
    return await user.save();
  }

  /**
   * Remove user
   * @param id
   * @returns
   */
  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    return await this.userModel.findByIdAndDelete(id);
  }

  /**
   * Check exist email
   * @param email
   * @param skipId
   * @returns
   */
  async isExistEmail(email: string, skipId?: string) {
    const extras: any = {};
    if (skipId) {
      extras._id = {
        $ne: skipId,
      };
    }

    return await this.userModel
      .findOne({
        email,
        ...extras,
      })
      .select('email');
  }
}
