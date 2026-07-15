import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('[Database Error] MONGODB_URI is not set in environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB Atlas: ${error instanceof Error ? error.message : error}`);
    throw error; // Propagate error to crash the bootstrap if failed
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Alert] MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Mongoose connection error: ${err}`);
});
