import express from 'express';
import jwt from 'jsonwebtoken';

import UserModel from '../models/user.js';

const router = express.Router();

router.post('/', (req, res, next) => {
  UserModel.new(req.body)
    .then(
      (user) => {
        const token = jwt.sign({ _id: user._id }, 'JWT KEY');
        res.json({ success: true, message: 'Authenticated', token, user });
      },
      err => next(err),
    );
});

module.exports = router;
