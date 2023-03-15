const express = require('express');
const path = require('path');

const cookieSession = require('cookie-session');

const app = express();

const createError = require('http-errors');

const bodyParser = require('body-parser');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

// here we are creating instance of service, and since constructor's of these services accept dataFile, we are passing data file
const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

const routes = require('./routes/index');

// this makes express to trust cookies that are passed through reverse proxy
app.set('trust proxy', 1);

app.use(
  cookieSession({
    name: 'session',
    keys: ['jhgdssd', 'kjhgsdfyuhjkf'],
  })
);

// this is used to extract data sent in body of request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// we are using embedded javascript as Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

const port = 3000;

// global variable
app.locals.siteName = 'ROUX Meetups';

// it tells application to load static folder, and if we remove this line, all images and styles will be missing
app.use(express.static(path.join(__dirname, './static')));

app.use(async (req, res, next) => {
  const names = await speakersService.getNames();
  res.locals.speakersNames = names;

  // now this variable "someVariable" will be avaiable in any template and also to the layout file
  res.locals.someVariable = 'hello';
  return next();
});

app.use('/', routes({ feedbackService, speakersService }));
// app.use('/speakers', speakersRoutes());

app.use((req, res, next) => {
  return next(createError(404, 'File Not Found'));
});

// error handling middlewear since it takes 4 arguments
app.use((error, req, res, next) => {
  res.locals.message = error.message;
  const status = error.status || 500;
  res.locals.status = status;

  res.status(status);

  res.render('error');
});

app.listen(port, () => {
  // console.log('server started');
});
