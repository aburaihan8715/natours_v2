/* eslint-disable no-useless-escape */
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config/env.config.js';

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isDeleted: {
      type: Boolean,

      default: false,
    },
    profilePicture: { type: String, default: null },
  },
  { timestamps: true },
);

// Indexing email for faster queries if needed
UserSchema.index({ email: 1 });

// DOCUMENT MIDDLEWARE
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password with bcrypt
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds) || 10,
  );
  next();
});

// STATIC METHODS
UserSchema.statics.getUserByEmail = async function (email) {
  return await this.findOne({ email }).select('+password');
};

UserSchema.statics.getUserById = async function (id) {
  return await this.findById(id).select('+password');
};

UserSchema.statics.isPasswordCorrect = async function (
  plainTextPassword,
  hashedPassword,
) {
  if (!plainTextPassword || !hashedPassword) {
    throw new Error(
      'Both plain text password and hashed password are required for comparison.',
    );
  }

  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

UserSchema.statics.isPasswordChangedAfterJwtIssued = function (
  passwordChangedTimestamp,
  jwtIssuedTimestamp,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User =
  mongoose.models.User || mongoose.model('User', UserSchema);
