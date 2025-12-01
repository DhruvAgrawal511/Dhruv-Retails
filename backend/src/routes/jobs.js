const express = require('express');
const router = express.Router();
const { syncQueue } = require('../queue');
const { syncAllTenants } = require('../services/syncService');

router.get('/sync', async (req, res) => {
  try {
    console.log('[API] Manual sync requested');
    await syncAllTenants();
    return res.json({ message: 'Sync completed successfully' });
  } catch (err) {
    console.error('Manual sync error:', err);
    return res.status(500).json({ error: 'Sync failed: ' + err.message });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const job = await syncQueue.add('syncAllTenants', {});
    return res.json({ message: 'Sync job enqueued', jobId: job.id });
  } catch (err) {
    console.error('Enqueue sync error:', err);
    return res.status(500).json({ error: 'Failed to enqueue sync job' });
  }
});

module.exports = router;
