import express from 'express';
import CardModel = from '../models/card';

const router = express.Router();

router.post('/', (req, res, next) => {
  CardModel.doCard(res.userId, res.wordId, res.upcoming, res.responseQuality)
    .then(
      result => res.json({ success: true }),
      err => next(err),
    );
});
