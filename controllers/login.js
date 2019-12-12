import jwt from 'jsonwebtoken';
import express from 'express';

import MongoClient from '../lib/MongoClient.js';
import { getHashFromSalt } from '../lib/cryptoUtil.js'; 

const router = express.Router();

router.post('/', (req, res, next) => {
  MongoClient.getDb().collection('users').findOne({ "general.username": req.body.username }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      const error = new Error('Authentication failed. User not found.');
      error.status = 401;
      return next(error);
    } else if (user) {
      const hashResult = getHashFromSalt(req.body.password, user.salt);
      if (user.password !== hashResult) {
        const error = new Error('Authentication failed. User not found.');
        error.status = 401;
        return next(error);
      }
      const token = jwt.sign(user._id, 'JWT KEY');
      res.json({ success: true, message: 'Authenticated', jwt: token, user });
    }
  });
});

module.exports = router;
