import mongoose from "mongoose";

const MONGODB_DB = process.env.MONGODB_DB || "test";

// Reuse the connection across hot reloads (dev) and route invocations (prod).
if (!globalThis.__gloriaMongoose) {
  globalThis.__gloriaMongoose = { conn: null, promise: null };
}
const cached = globalThis.__gloriaMongoose;

async function dbConnect() {
  const uri = process.env.MONGODB_URI;

  // Read the env var at call time, not module load time, so `next build`
  // succeeds even when the production secret is only set on the host.
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local locally or to the Render environment."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: MONGODB_DB,
        bufferCommands: false,
        serverSelectionTimeoutMS: 15000,
        maxPoolSize: 10,
      })
      .then((instance) => instance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
