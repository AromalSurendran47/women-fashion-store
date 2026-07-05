import mongoose from "mongoose";

/**
 * Cached Mongoose connection.
 * In Next.js (App Router) the module can be re-evaluated on hot reload, so we
 * cache the connection on the global object to avoid opening a new pool on
 * every request.
 */

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aura_fashion";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
