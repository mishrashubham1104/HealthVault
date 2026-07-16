import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDb = async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthvault';
  console.log(`[DB Cleanup] Connecting to database at: ${dbUri}`);
  try {
    await mongoose.connect(dbUri);
    console.log('[DB Cleanup] Connection successful! Purging database...');
    
    // Drop database to clear all collections and indices
    await mongoose.connection.db.dropDatabase();
    console.log('[DB Cleanup] Database dropped successfully! All collections are now empty.');
  } catch (error) {
    console.error('[DB Cleanup Error] Failed to drop database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('[DB Cleanup] Database connection closed.');
  }
};

clearDb();
