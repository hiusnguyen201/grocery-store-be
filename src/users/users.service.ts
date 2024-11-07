import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';
import mongoose, { FilterQuery, Model, RootFilterQuery } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { MESSAGE_ERROR } from 'src/constants/messages';
import {
  CloudinaryService,
  UploadBufferFile,
} from 'src/cloudinary/cloudinary.service';
import { makeHash } from 'src/utils/bcrypt.util';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { PER_PAGE } from 'src/constants/common';
import { isValidObjectId } from 'src/utils/validation.util';
import { PageMetaDto } from 'src/dtos/page-meta.dto';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';
import { randomString } from 'src/utils/string.utils';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cloudinaryService: CloudinaryService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  /**
   * Create user
   * @param createUserDto
   * @param file
   * @returns
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.isExistEmail(createUserDto.email)) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const passwordGenerate = randomString(8);
    const hashedPassword = await makeHash(passwordGenerate);
    const newUser = await this.userModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...createUserDto,
      password: hashedPassword,
    });

    this.mailService.sendPassword(newUser.email, passwordGenerate);

    // Return user without password
    return await this.findOne(newUser._id);
  }

  /**
   * Count all user
   * @param role
   * @returns
   */
  private async countAll(filterQuery: FilterQuery<User>): Promise<number> {
    return await this.userModel.countDocuments(filterQuery);
  }

  /**
   * Find all user
   * @param queryString
   * @returns
   */
  async findAll(
    req: Request,
    query: FindAllUserDto,
  ): Promise<{ meta: PageMetaDto; users: User[] }> {
    const {
      page = 1,
      limit = PER_PAGE[0],
      keyword = '',
      status = null,
    } = query;

    const filterQuery: RootFilterQuery<User> = {
      $or: [
        { name: { $regex: keyword, $options: 'i' } }, // Option "i" - Search lowercase and uppercase
        { email: { $regex: keyword, $options: 'i' } },
      ],

      [status && 'status']: status,
    };

    const totalCount = await this.countAll(filterQuery);

    const pageMetaDto = new PageMetaDto({ req, limit, page, totalCount });

    const users = await this.userModel
      .find(filterQuery)
      .skip(pageMetaDto.offset)
      .limit(limit)
      .select('-password');

    return { meta: pageMetaDto, users };
  }

  /**
   * Find user
   * @param id
   * @returns
   */
  async findOne(id: string, selectFields: string = '-password'): Promise<User> {
    const filter: Partial<User> = {};

    if (isValidObjectId(id)) {
      filter._id = id;
    } else if (isEmail(id)) {
      filter.email = id;
    } else {
      return null;
    }

    return await this.userModel.findOne(filter).select(selectFields);
  }

  /**
   * Update info user
   * @param id
   * @param updateUserDto
   * @returns
   */
  async updateInfo(id: string, updateUserDto: UpdateUserDto): Promise<User> {
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
  async updateAvatar(id: string, file: Express.Multer.File): Promise<User> {
    if (!file) {
      throw new BadRequestException(MESSAGE_ERROR.FILE_NOT_FOUND);
    }

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(MESSAGE_ERROR.USER_NOT_FOUND);
    }

    const result = await this.cloudinaryService.saveAvatar(
      file.buffer,
      `avatars/${user._id}`,
      `${file.originalname}-${new Date().getTime()}`,
    );

    return await this.userModel.findByIdAndUpdate(
      id,
      {
        avatar: result.url,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Remove user
   * @param id
   * @returns
   */
  async remove(id: string): Promise<User> {
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
  async isExistEmail(email: string, skipId?: string): Promise<boolean> {
    const extras: any = {};
    if (skipId) {
      extras._id = {
        $ne: skipId,
      };
    }

    const user = await this.userModel
      .findOne({
        email,
        ...extras,
      })
      .select('email');

    return !!user;
  }

  /**
   * Register user
   * @param registerAuthDto
   * @param file
   * @returns
   */
  async register(
    registerAuthDto: RegisterAuthDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    if (await this.isExistEmail(registerAuthDto.email)) {
      throw new BadRequestException(MESSAGE_ERROR.EMAIL_EXIST);
    }

    const hashedPassword = await makeHash(registerAuthDto.password);
    const newUser = await this.userModel.create({
      _id: new mongoose.Types.ObjectId(),
      ...registerAuthDto,
      password: hashedPassword,
    });

    if (file) {
      this.cloudinaryService
        .saveAvatar(
          file.buffer,
          `avatars/${newUser._id}`,
          `${file.originalname}-${new Date().getTime()}`,
        )
        .then(async (result) => {
          await this.userModel.findByIdAndUpdate(newUser._id, {
            avatar: result.url,
          });
        });
    }

    this.mailService.sendWelcome(
      newUser.email,
      this.configService.get('projectName'),
    );

    return await this.findOne(newUser._id);
  }
}
