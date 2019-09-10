import express from 'express';

import user from './user';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true });
});

router.use('/user', user);

module.exports = router;
