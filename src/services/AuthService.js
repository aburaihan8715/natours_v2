import AppError from '../errors/AppError.js';
import { User } from '../models/userModel.js';
import httpStatus from 'http-status';
import { createToken } from '../utils/createToken.js';
import config from '../config/env.config.js';
import bcrypt from 'bcrypt';
import { decodeToken } from '../utils/decodeToken.js';
import { sendEmail } from '../utils/sendEmail.js';

// REGISTER OR CREATE USER
const registerIntoDB = async (payload) => {
  let newUser = await User.create(payload);

  if (!newUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to cerate user. Try again!',
    );
  }
  newUser = newUser.toObject();
  delete newUser.password;
  delete newUser.__v;

  return newUser;
};

// LOGIN USER
const loginFromDB = async (payload) => {
  // 01. checking if the user is exist
  let user = await User.getUserByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  // 02. checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // 03. checking if the password is correct
  const isPasswordCorrect = await User.isPasswordCorrect(
    payload?.password,
    user?.password,
  );

  if (!isPasswordCorrect) {
    throw new AppError(400, 'Wrong credentials!');
  }

  // 04. create accessToken and refreshToken
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  // 05. delete password form the user
  user = user.toObject();
  delete user.password;
  delete user.__v;

  // 06. return tokens and user to the controller
  return {
    accessToken,
    refreshToken,
    user,
  };
};

// CHANGE PASSWORD
const changePasswordIntoDB = async (userId, payload) => {
  // 01 check user exists
  const user = await User.getUserById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  }

  // 02 check user is deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User already deleted !');
  }

  // 03 check password correct
  const isPasswordCorrect = await User.isPasswordCorrect(
    payload.currentPassword,
    user?.password,
  );

  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
  }

  // 04 hash the new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  // 05 update the new password
  await User.findByIdAndUpdate(user._id, {
    password: newHashedPassword,
    passwordChangedAt: new Date(),
  });

  // 06 finally return null
  return null;
};

// UPDATE PROFILE
const updateProfileIntoDB = async (userId, payload) => {
  // 01 check user exists
  let user = await User.getUserById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  }

  //  02 update the password field
  user = await User.findByIdAndUpdate(user._id, payload, {
    new: true,
  });

  // 03 create accessToken and refreshToken
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  // 04 delete password form the user
  user = user.toObject();
  delete user.password;
  delete user.__v;

  // 05 return tokens and user to the controller
  return {
    accessToken,
    refreshToken,
    user,
  };
};

// FORGET PASSWORD
const forgetPasswordEmail = async (email) => {
  // 01 check user exists
  const user = await User.getUserByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  }
  // 02 check user already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User already deleted !');
  }

  // 03 create password reset token
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const passwordResetToken = createToken(
    jwtPayload,
    config.jwt_password_reset_secret,
    config.jwt_password_reset_expires_in,
  );

  // 04 send the reset token to the user email
  const passwordResetUILink = `${config.reset_pass_ui_link}?id=${user._id}&passwordResetToken=${passwordResetToken} `;

  sendEmail(user.email, passwordResetUILink);

  return null;
};

// RESET PASSWORD
const resetPasswordIntoDB = async (payload, passwordResetToken) => {
  // 01 check user exists
  const user = await User.getUserById(payload?.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  }

  // 02 check user already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // 03 decode the token and check it
  const decoded = await decodeToken(
    passwordResetToken,
    config.jwt_password_reset_secret,
  );

  if (payload.id !== decoded._id) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  // 04 hash the new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  //  05 update the password field
  await User.findByIdAndUpdate(decoded._id, {
    password: newHashedPassword,
    passwordChangedAt: new Date(),
  });

  return null;
};

// GET ACCESS TOKEN BY REFRESH TOKEN
const getAccessTokenByRefreshTokenFromServer = async (refreshToken) => {
  // 01 decode the giver token
  const decoded = await decodeToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  const { _id, iat } = decoded;

  // 02 check user exists
  const user = await User.getUserById(_id);

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The user belonging to this token does no longer exist!',
    );
  }
  // 03 check user is deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User already deleted !');
  }

  // 04 check password changed after jwt issued
  if (
    user.passwordChangedAt &&
    User.isPasswordChangedAfterJwtIssued(user.passwordChangedAt, iat)
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'User recently changed password! Please login again.',
    );
  }

  // 05 create access token
  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  // 06 return the access token
  return {
    accessToken,
  };
};

export const AuthService = {
  registerIntoDB,
  loginFromDB,
  changePasswordIntoDB,
  updateProfileIntoDB,
  forgetPasswordEmail,
  resetPasswordIntoDB,
  getAccessTokenByRefreshTokenFromServer,
};
