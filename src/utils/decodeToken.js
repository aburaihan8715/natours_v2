import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../errors/AppError.js';
export const decodeToken = async (token, secret) => {
  try {
    // return jwt.verify(token, secret);
    return await promisify(jwt.verify)(token, secret);
  } catch (error) {
    console.log('Decode token error', error);
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Error while decoding token!',
    );
  }
};

//   const decoded = await promisify(jwt.verify)(token, jwt_access_secret);
