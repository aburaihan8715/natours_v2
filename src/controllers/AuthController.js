import config from '../config/env.config.js';
import { AuthService } from '../services/AuthService.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import httpStatus from 'http-status';

// REGISTER OR CREATE USER
const register = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const registerData = { username, email, password, passwordConfirm };
  const newUser = await AuthService.registerIntoDB(registerData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
});

// LOGIN
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const loginData = { email, password };
  const userInfo = await AuthService.loginFromDB(loginData);

  const { refreshToken, accessToken, user } = userInfo;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: { accessToken, refreshToken, user },
  });
});

// CHANGE PASSWORD
const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;
  const id = req.user?._id;

  const result = await AuthService.changePasswordIntoDB(id, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password updated successfully!',
    data: result,
  });
});

// UPDATE PROFILE
const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const userInfo = await AuthService.updateProfileIntoDB(userId, {
    ...JSON.parse(req.body.data),
    profilePicture: req.file?.path,
  });

  const { refreshToken, accessToken, user } = userInfo;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Settings updated successfully',
    data: { accessToken, refreshToken, user },
  });
});

// FORGET PASSWORD
const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await AuthService.forgetPasswordEmail(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated successfully!',
    data: result,
  });
});

// RESET PASSWORD
const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  const result = await AuthService.resetPasswordIntoDB(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successful!',
    data: result,
  });
});

// GET ACCESS TOKEN BY REFRESH TOKEN
const getAccessTokenByRefreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result =
    await AuthService.getAccessTokenByRefreshTokenFromServer(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token by refresh token is retrieved successfully!',
    data: result,
  });
});

export const AuthController = {
  register,
  login,
  changePassword,
  updateProfile,
  forgetPassword,
  resetPassword,
  getAccessTokenByRefreshToken,
};
