import mongoose from 'mongoose';
import { app } from './app.js';
import config from './config/env.config.js';

// UNCAUGHT EXCEPTION
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

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

// import mongoose from 'mongoose';
// import { app } from './app.js';
// import config from './config/env.config.js';

// let server;

// async function main() {
//   try {
//     const { ConnectionStates } = await mongoose.connect(
//       config.database_url,
//     );

//     if (ConnectionStates.connected) {
//       console.log('Db is connected');
//       // CREATE SUPER ADMIN
//       // await seedSuperAdmin();
//     }

//     app.listen(config.port, () => {
//       console.log(`App is listening at http://localhost:${config.port}`);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }

// main();

// // UNHANDLED REJECTIONS
// process.on('unhandledRejection', () => {
//   console.log(`😈 unhandledRejection is detected , shutting down ...`);
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });

// // UNCAUGHT EXCEPTION
// process.on('uncaughtException', () => {
//   console.log(`😈 uncaughtException is detected , shutting down ...`);
//   process.exit(1);
// });

// ============End=============
