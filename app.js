import express from 'express';
import path from 'path';
import reqLogger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import controllers from './controllers';
import logger from './lib/logger';

var app = express();

app.use(reqLogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(controllers);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  logger.error(err);
  res.json({ success: false });
});

module.exports = app;
