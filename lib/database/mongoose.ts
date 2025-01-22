import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

/**
 * Defines the structure of our MongoDB connection
 * This interface ensures type safety for our connection caching mechanism
 */
interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Type augmentation for the global scope using modern TypeScript practices
 * Instead of using 'var', we extend the NodeJS.Global interface
 * This is the preferred way to add types to the global scope in Node.js environments
 */
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Global {
    mongoose: MongooseConnection | undefined;
  }
}

/**
 * Initialize our connection cache
 * We first create a type-safe reference to the global object
 * This provides proper typing while maintaining access to the global scope
 */
const globalWithMongoose = global as typeof global & {
  mongoose: MongooseConnection | undefined;
};

/**
 * Create our cached connection object with proper typing
 * If a global connection exists, use it; otherwise create a new one
 */
const cached: MongooseConnection = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
};

/**
 * Set the global mongoose property to maintain our singleton pattern
 * This ensures we reuse the same connection across our application
 */
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

/**
 * Establishes and manages a cached connection to MongoDB using mongoose
 * Implements a singleton pattern to prevent multiple concurrent connections
 * 
 * @returns Promise<Mongoose> A promise that resolves to the mongoose instance
 * @throws Error if MONGODB_URL is not defined
 */
export const connectToDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URL) {
    throw new Error(
      "Please define the MONGODB_URL environment variable inside .env"
    );
  }

  try {
    cached.promise = cached.promise ||
      mongoose.connect(MONGODB_URL, {
        dbName: "imaginify",
        bufferCommands: false,
      });

    cached.conn = await cached.promise;
    
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};