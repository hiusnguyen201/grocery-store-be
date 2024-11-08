import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { EUserRoles, EUserStatuses } from 'src/constants/common';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop()
  _id: string;

  @Prop({ type: String, maxLength: 400 })
  avatar: string;

  @Prop({ type: String, required: true, maxLength: 50 })
  name: string;

  @Prop({ type: String, required: true, maxLength: 200, unique: true })
  email: string;

  @Prop({ type: String, maxLength: 100 })
  password: string;

  @Prop({ type: String, maxLength: 50 })
  googleId?: string;

  @Prop({ type: String, maxLength: 50 })
  facebookId?: string;

  @Prop({
    type: String,
    required: true,
    enum: EUserRoles,
    default: EUserRoles.USER,
  })
  role: string;

  @Prop({
    type: String,
    required: true,
    enum: EUserStatuses,
    default: EUserStatuses.INACTIVE,
  })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
