import express from 'express';

import user from './user';
import card from './card';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true });
});

router.use('/user', user);
router.use('/card', card);

module.exports = router;
