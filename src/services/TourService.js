import QueryBuilder from '../builder/QueryBuilder.js';
import AppError from '../errors/AppError.js';
import { Tour } from '../models/TourModel.js';
import httpStatus from 'http-status';

// GET ALL TourS
const getAllToursFromDB = async (query) => {
  const TourQuery = new QueryBuilder(Tour.find(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await TourQuery.modelQuery.exec();
  const meta = await TourQuery.countTotal();
  return {
    meta,
    result,
  };
};

// GET SINGLE Tour
const getSingleTourFromDB = async (tourId) => {
  const result = await Tour.findById(tourId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tour not found !');
  }

  // if (result && result.isDeleted) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'Tour has been deleted!');
  // }
  return result;
};

// DELETE Tour
const deleteTourFromDB = async (tourId) => {
  const result = await Tour.findByIdAndUpdate(
    tourId,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tour not found!');
  }

  return result;
};

// GET Tour STATS
const getTourStatsFromDB = async () => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const previousYear = currentYear - 1;

  const data = await Tour.aggregate([
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
        numberOfTours: { $sum: 1 },
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

export const TourService = {
  getAllToursFromDB,
  getSingleTourFromDB,
  deleteTourFromDB,
  getTourStatsFromDB,
};
