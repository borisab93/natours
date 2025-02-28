const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exceptions! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Load environment variables
dotenv.config({ path: './config.env' });
const app = require('./app');

// Format database connection string
const DB = process.env.DATABASE
  ? process.env.DATABASE.replace(
      '<password>',
      process.env.DATABASE_PASSWORD || ''
    )
  : '';

// MongoDB connection with connection pooling optimized for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      // Use connection pooling for serverless
      poolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`DB connection successful!`);
    cachedDb = client;
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Connect only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectToDatabase().catch(console.error);
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UnHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED, Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

// Export the app for serverless functions
module.exports = app;
