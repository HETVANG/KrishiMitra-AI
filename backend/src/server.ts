import dotenv from 'dotenv';
// Load environment variables before importing app and db
dotenv.config();

import dns from 'dns';
// Resolve MongoDB Atlas SRV connection strings via Cloudflare and Google DNS
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (dnsErr) {
  console.warn('[DNS Config Warning] Failed to set public DNS servers:', dnsErr);
}

import app from './app';
import { connectDB } from './config/db';
import { marketSyncService } from './services/MarketSyncService';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    try {
      marketSyncService.scheduleDailySync();
      await marketSyncService.syncLatestPrices();
    } catch (syncErr) {
      console.warn('[Server] Market sync initialization failed. The app will continue running.', syncErr);
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] KrishiMitra AI Server listening on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('SIGTERM', () => {
      console.log('[Server] SIGTERM received. Shutting down server gracefully...');
      server.close(() => {
        console.log('[Server] Closed remaining connections. Exiting process.');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(`[Server Error] Unhandled Promise Rejection at: ${promise}, reason: ${reason}`);
    });
  } catch (err) {
    console.error('[Server Bootstrap Error] Database connection failed. Express server will not start:', err);
    process.exit(1);
  }
};

startServer();
