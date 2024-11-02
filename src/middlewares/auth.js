import httpStatus from 'http-status';
import AppError from '../errors/AppError.js';
import { User } from '../modules/user/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import { decodeToken } from '../utils/decodeToken.js';
import config from '../config/env.config.js';

const auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    // 01 check token
    let token = '';
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You have no token, please login again!',
      );
    }

    // 02 Decode the token
    const decodedData = await decodeToken(token, config.jwt_access_secret);

    if (!decodedData) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token!');
    }

    const { role, userId, iat } = decodedData;

    // 03 Check user still exists
    const user = await User.getUserById(userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }

    // 04 Check already deleted
    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
    }

    // 05 Check password changed
    if (
      user.passwordChangedAt &&
      User.isPasswordChangedAfterJwtIssued(user.passwordChangedAt, iat)
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized !',
      );
    }

    // 06 Check role
    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not allowed!');
    }
    // 07 Set decoded data as user in request and grant access
    req.user = decodedData;
    next();
  });
};

export default auth;
