const mongoose = require('mongoose');

let memServerInstance = null;

const connectDB = async () => {
  // If already connected, return active connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutrack_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection failed (${error.message}).`);

    if (process.env.NODE_ENV !== 'production') {
      try {
        if (!memServerInstance) {
          console.log('[Database] Starting in-memory MongoDB server for local development...');
          const { MongoMemoryServer } = require('mongodb-memory-server');
          memServerInstance = await MongoMemoryServer.create();
        }
        const memUri = memServerInstance.getUri();
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
