import QueryBuilder from '../builder/QueryBuilder.js';
import AppError from '../errors/AppError.js';
import { User } from '../models/userModel.js';
import httpStatus from 'http-status';

// GET ALL USERS
const getAllUsersFromDB = async (query) => {
  const UserQuery = new QueryBuilder(User.find(), query)
    .search(['username', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await UserQuery.modelQuery.exec();
  const meta = await UserQuery.countTotal();
  return {
    meta,
    result,
  };
};

// GET SINGLE USER
const getSingleUserFromDB = async (userId) => {
  const result = await User.findById(userId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found !');
  }

  if (result && result.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User has been deleted!');
  }
  return result;
};

// DELETE USER
const deleteUserFromDB = async (userId) => {
  const result = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  return result;
};

// GET USER STATS
const getUserStatsFromDB = async () => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const previousYear = currentYear - 1;

  const data = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${previousYear}-01-01`),
          $lte: new Date(`${previousYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        numberOfUsers: { $sum: 1 },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  return data;
};

export const UserService = {
  getAllUsersFromDB,
  getSingleUserFromDB,
  deleteUserFromDB,
  getUserStatsFromDB,
};
