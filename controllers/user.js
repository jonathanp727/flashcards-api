import express from 'express';
import UserModel from '../models/user';

const router = express.Router();

// get user from token
router.get('/', async (req, res, next) => {
  UserModel.getWithUpcoming(req.userId)
    .then(
      result => res.json(result),
      err => {
        err.status = 401;
        next(err);
      },
    );
});

// show
router.get('/:id', (req, res, next) => {
  UserModel.getWithUpcoming(req.params.id)
    .then(
      result => res.json(result),
      err => next(err),
    );
});

// new
router.post('/', (req, res, next) => {
  UserModel.new(req.body)
    .then(
      result => res.json(result),
      err => next(err),
    );
});

// update
router.put('/:id', (req, res, next) => {
  UserModel.update(req.params.id, req.body)
    .then(
      () => res.json({ success: true }),
      err => next(err),
    );
});

// delete
router.delete('/:id', (req, res, next) => {
  UserModel.delete(req.params.id)
    .then(
      () => res.json({ success: true }),
      err => next(err),
    );
});

module.exports = router;
