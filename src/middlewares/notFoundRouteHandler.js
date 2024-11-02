import httpStatus from 'http-status';

const notFoundRouteHandler = (req, res, next) => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: `API ${req.originalUrl} not found!!`,
    error: '',
  });
};

export default notFoundRouteHandler;
