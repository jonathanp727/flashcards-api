import express from 'express';

import user from './user';
import word from './word';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true });
});

router.use('/user', user);
router.use('/word', word);

module.exports = router;
