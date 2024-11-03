import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config/env.config.js';

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (value) {
          return value === this.password;
        },
        message: 'Password are not the same!',
      },
    },
    passwordChangedAt: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },

    profilePicture: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
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
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

// manipulate passwordChangedAt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// QUERY MIDDLEWARE
// deselect document
UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHODS
// compare password
UserSchema.methods.isPasswordCorrect = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// If password changed after jwt issued
UserSchema.methods.isPasswordChangedAfterJwtIssued = function (
  passwordChangedTimestamp,
  jwtIssuedTimestamp,
) {
  const passChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passChangedTime > jwtIssuedTimestamp;
};

// generate random token
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// STATIC METHODS
UserSchema.statics.getUserByEmail = async function (email) {
  return await this.findOne({ email }).select('+password');
};

UserSchema.statics.getUserById = async function (id) {
  return await this.findById(id).select('+password');
};

// UserSchema.statics.isPasswordCorrect = async function (
//   plainTextPassword,
//   hashedPassword,
// ) {
//   if (!plainTextPassword || !hashedPassword) {
//     throw new Error(
//       'Both plain text password and hashed password are required for comparison.',
//     );
//   }

//   return await bcrypt.compare(plainTextPassword, hashedPassword);
// };

// UserSchema.statics.isPasswordChangedAfterJwtIssued = function (
//   passwordChangedTimestamp,
//   jwtIssuedTimestamp,
// ) {
//   const passwordChangedTime =
//     new Date(passwordChangedTimestamp).getTime() / 1000;
//   return passwordChangedTime > jwtIssuedTimestamp;
// };

export const User =
  mongoose.models.User || mongoose.model('User', UserSchema);
