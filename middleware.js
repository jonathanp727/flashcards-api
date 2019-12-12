import jwt from 'jsonwebtoken';

const middleware = {
  // route middleware to verify a token
  authenticate(req, res, next) {
    const token = req.headers.authorization ? req.headers.authorization.substring(7) : null; // Remove 'Bearer '
    if (token) {
      jwt.verify(token, 'JWT KEY', (err, decoded) => {
        if (err) {
          const error = new Error('Failed to authenticate token');
          error.status = 401;
          next(error);
        } else {
          req.userId = decoded._id;
          next();
        }
      });
    } else {
      const error = new Error('No token provided');
      error.status = 403;
      next(error);
    }
  },


};

export default middleware;
