// routes/public.js
import express from 'express';
const router = express.Router();

router.get('/ping', (req, res) => res.json({ ok: true, message: 'pong' }));

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    db: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
    counts: { users: 0, plants: 0, categories: 0, events: 0 },
  });
});

export default router;
