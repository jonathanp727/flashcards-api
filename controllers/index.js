import express from 'express';

import user from './user';
import word from './word';
import dict from './dict';
import join from './join';
import login from './login';
import middleware from '../middleware';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true });
});

router.use('/join', join);
router.use('/login', login);

router.use(middleware.authenticate);

router.use('/user', user);
router.use('/word', word);
router.use('/dict', dict);

module.exports = router;
