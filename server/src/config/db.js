import mongoose from 'mongoose';

export async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    console.error('MONGODB_URI not provided; skipping DB connection. Set MONGODB_URI in environment.');
    return null;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(mongoUri, {
      // useNewUrlParser and useUnifiedTopology are default in mongoose v6+
    });
    console.log(`MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    return null;
  }
}
