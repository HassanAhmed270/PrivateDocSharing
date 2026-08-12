import mongoose from 'mongoose';

export const USER_ROLES = Object.freeze({
  OWNER: 'owner',
  REVIEWER: 'reviewer',
  MEMBER: 'member',
});

export const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.MEMBER,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
