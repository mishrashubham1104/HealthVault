import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthvault';
  
  if (dbUri.startsWith('mongodb+srv://')) {
    try {
      const hostname = dbUri.split('@')[1].split('/')[0].split('?')[0];
      await new Promise((resolve) => {
        dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err) => {
          if (err) {
            console.log(`[Database] Default DNS failed to resolve SRV for ${hostname}. Setting DNS to Google/Cloudflare resolvers...`);
            dns.setServers(['8.8.8.8', '1.1.1.1']);
          }
          resolve();
        });
      });
    } catch (dnsErr) {
      console.warn(`[Database Warning] DNS pre-resolution setup failed: ${dnsErr.message}`);
    }
  }
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000 // Try to connect for 5 seconds
    });
    console.log(`[Database] MongoDB Connected to: ${mongoose.connection.host}`);
    global.isMockDB = false;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.warn(`[Database Warning] Running HealthVault in Demo Mode with In-Memory Mock Database! Data will not persist across server restarts.`);
    global.isMockDB = true;
  }
};

export default connectDB;
