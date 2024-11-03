import mongoose from 'mongoose';
import config from './config/env.config.js';

// UNCAUGHT EXCEPTION
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

import { app } from './app.js';

mongoose
  .connect(config.database_url, {})
  .then(() => console.log(`DB connection successful!`));

const server = app.listen(config.port, () => {
  console.log(`App is listening at http://localhost:${config.port}`);
});

// UNHANDLED REJECTIONS
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
