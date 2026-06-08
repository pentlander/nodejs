const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const router = express.Router();

router.get('/', (req, res) => {
  execFile('/bin/sync', (err) => {
    if (err) {
      console.error('GET /api/sync error:', err);
      return res.status(500).json({ error: 'sync failed' });
    }

    res.json({ ok: true, syscall: 'sync' });
  });
});

router.get('/syncfs', (req, res) => {
  execFile('/bin/sync', ['-f', os.tmpdir()], (err) => {
    if (err) {
      console.error('GET /api/sync/syncfs error:', err);
      return res.status(500).json({ error: 'syncfs failed' });
    }

    res.json({ ok: true, syscall: 'syncfs' });
  });
});

router.get('/fsync', (req, res) => {
  const filePath = path.join(os.tmpdir(), `fsync-${process.pid}-${Date.now()}`);
  const fd = fs.openSync(filePath, 'w');

  try {
    fs.writeSync(fd, 'fsync test');
    fs.fsyncSync(fd);
    res.json({ ok: true, syscall: 'fsync' });
  } catch (err) {
    console.error('GET /api/sync/fsync error:', err);
    res.status(500).json({ error: 'fsync failed' });
  } finally {
    fs.closeSync(fd);
    fs.rmSync(filePath, { force: true });
  }
});

router.get('/fdatasync', (req, res) => {
  const filePath = path.join(os.tmpdir(), `fdatasync-${process.pid}-${Date.now()}`);
  const fd = fs.openSync(filePath, 'w');

  try {
    fs.writeSync(fd, 'fdatasync test');
    fs.fdatasyncSync(fd);
    res.json({ ok: true, syscall: 'fdatasync' });
  } catch (err) {
    console.error('GET /api/sync/fdatasync error:', err);
    res.status(500).json({ error: 'fdatasync failed' });
  } finally {
    fs.closeSync(fd);
    fs.rmSync(filePath, { force: true });
  }
});

module.exports = router;
