var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var fs = require('fs');

var indexRouter = require('./routes/index');
var homeRouter = require('./routes/home');
var registracijaRouter = require('./routes/registracija');
var upravljajRouter = require('./routes/upravljanje_profila');
var konkursRouter = require('./routes/konkurs');
var adminRouter = require('./routes/admin');
var kreirajKonkursRouter = require('./routes/kreirajKonkurs');
var razgovorKRouter = require('./routes/chat_k');
var razgovorHrRouter = require('./routes/chat_hr');
var konkursHRRouter = require('./routes/konkursHR');
var kandidatRouter = require('./routes/kandidat');
var automatskiPDFRouter = require('./routes/pdf');
var cookiesRouter = require('./Kontroler/cookies');

var app = express();

const uploadDir = path.join(__dirname, 'uploads');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
// ------------------------------------------------------
app.use('/home', homeRouter);
app.use('/registracija',registracijaRouter);
app.use('/upravljanje_profila',upravljajRouter);
app.use('/konkurs',konkursRouter);
app.use('/admin',adminRouter);
app.use('/kreirajKonkurs',kreirajKonkursRouter);
app.use('/uploads', express.static(uploadDir));
app.use('/chat_k',razgovorKRouter);
app.use('/chat_hr',razgovorHrRouter);
app.use('/konkursHR', konkursHRRouter);
app.use('/kandidat', kandidatRouter);
app.use('/pdf',automatskiPDFRouter);
// SESIJA:
app.use(session({
  secret: 'tajna_kljuc', // Promijenite na odgovarajući ključ
  resave: false,
  saveUninitialized: false,
}));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
/*
app.use('/cookies', (req, res, next) => {
  const { setCookie, getCookie, clearCookies } = cookiesRouter;

  // Primjer ruta za cookies
  if (req.path === '/set') {
      return setCookie(req, res);
  } else if (req.path === '/get') {
      return getCookie(req, res);
  } else if (req.path === '/clear') {
      return clearCookies(req, res);
  }

  next();
}); */

module.exports = app;