const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutrack_db';

  try {
    // Attempt standard connection (Atlas or running local MongoDB)
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection failed (${error.message}).`);

    // In development, fall back to in-memory MongoDB for zero-friction local testing
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting in-memory MongoDB server for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] In-memory MongoDB Connected: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] Failed to start in-memory MongoDB:', memErr.message);
        throw error;
      }
    } else {
      console.error('[Database] Critical: Could not connect to MongoDB in production.');
      throw error;
    }
  }
};

module.exports = connectDB;
