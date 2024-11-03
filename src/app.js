import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import httpStatus from 'http-status';

import notFoundRouteHandler from './middlewares/notFoundRouteHandler.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import { UserRoutes } from './routes/UserRoute.js';
import { AuthRoutes } from './routes/AuthRoute.js';
import { TourRoutes } from './routes/TourRoute.js';

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARES
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: '10kb' }));
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// TEST ROUTE
app.get('/', (req, res) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Hello From Server',
  });
});

// ROUTES
app.use('/api/v2/auth', AuthRoutes);
app.use('/api/v2/users', UserRoutes);
app.use('/api/v2/tours', TourRoutes);

// NOT FOUND ROUTE HANDLER
app.use(notFoundRouteHandler);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);
