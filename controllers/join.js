import express from 'express';
import jwt from 'jsonwebtoken';

import UserModel from '../models/user.js';

const router = express.Router();

router.post('/', (req, res, next) => {
  userModel.new(req.body, (err, result) => {
    if (err) return next(err);
    // Create userData object that doesn't contain data for words
    // This keeps jwt tokens from being infinitely large
    const userData = result.ops[0].general;
    const token = jwt.sign(userData, 'JWT KEY');
    res.json({ success: true, message: 'Authenticated', token, id: result.insertedId });
  });
});

module.exports = router;
