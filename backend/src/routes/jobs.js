const express = require('express');
const router = express.Router();
const { syncQueue } = require('../queue');

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
