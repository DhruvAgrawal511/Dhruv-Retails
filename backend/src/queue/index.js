const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const path = require('path');
const { syncAllTenants } = require('../services/syncService');
const prisma = require('../prismaClient');

let connection;
let isConnected = false;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  connection.on('connect', () => {
    console.log('[Queue] Redis connected successfully');
    isConnected = true;
  });

  connection.on('error', (err) => {
    console.warn('[Queue] Redis connection error (will retry):', err.message);
    isConnected = false;
  });

  connection.on('reconnecting', () => {
    console.log('[Queue] Redis attempting to reconnect...');
  });
} catch (err) {
  console.error('[Queue] Failed to initialize Redis connection:', err.message);
  process.exit(1);
}

const syncQueue = new Queue('syncQueue', { connection });
const webhookQueue = new Queue('webhookQueue', { connection });

const syncWorker = new Worker('syncQueue', async (job) => {
  console.log('[Worker] Processing sync job', job.id);
  try {
    await syncAllTenants();
    return { success: true };
  } catch (err) {
    console.error('[Worker] Sync job error:', err.message);
    throw err;
  }
}, { connection });

syncWorker.on('error', (err) => {
  console.error('[Sync Worker] Error:', err.message);
});

syncWorker.on('failed', (job, err) => {
  console.error(`[Sync Worker] Job ${job.id} failed:`, err.message);
});

const webhookWorker = new Worker('webhookQueue', async (job) => {
  console.log('[Worker] Processing webhook job', job.id);
  const { tenantId, topic, payload } = job.data;
  try {
    await prisma.event.create({
      data: {
        tenantId: tenantId || 1,
        type: topic || 'webhook',
        payload: JSON.stringify(payload || {})
      }
    });
    return { success: true };
  } catch (err) {
    console.error('[Worker] Webhook job error:', err.message);
    throw err;
  }
}, { connection });

webhookWorker.on('error', (err) => {
  console.error('[Webhook Worker] Error:', err.message);
});

webhookWorker.on('failed', (job, err) => {
  console.error(`[Webhook Worker] Job ${job.id} failed:`, err.message);
});

module.exports = {
  connection,
  syncQueue,
  webhookQueue,
  isConnected: () => isConnected
};
