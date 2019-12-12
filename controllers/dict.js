import express from 'express';
import DictModel from '../models/dict';

const router = express.Router();

// show
router.get('/:word', (req, res, next) => {
  DictModel.lookup(req.params.word)
    .then(
      result => res.json(result),
      err => next(err),
    );
});

module.exports = router;
