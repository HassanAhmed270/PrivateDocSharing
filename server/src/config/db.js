import mongoose from 'mongoose';

export async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  mongoose.set('strictQuery', true);

  try {
    const connection = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB connected: ${connection.connection.host}:${connection.connection.port}/${connection.connection.name}`,
    );

    return connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}