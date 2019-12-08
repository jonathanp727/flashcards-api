import express from 'express';

import user from './user';
import word from './word';
import join from './join';
import login from './login';

const router = express.Router();


router.get('/', (req, res) => {
  res.json({ success: true });
});

router.use('/join', join);
router.use('/login', login);

router.use('/user', user);
router.use('/word', word);

module.exports = router;
