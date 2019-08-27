import express from 'express';

import user from './user';

const router = express.Router();

router.use('/user', user);

router.get('/api', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
