import express from 'express';
import WordModel from '../models/word';

const router = express.Router();

router.post('/', (req, res, next) => {
  WordModel.doCard(req.userId, req.body)
    .then(
      result => res.json(result),
      err => next(err),
    );
});

router.post('/inc', (req, res, next) => {
  WordModel.increment(req.userId, req.body)
    .then(
      result => res.json(result),
      err => next(err),
    );
});

module.exports = router;
