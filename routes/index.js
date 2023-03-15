const path = require('path');
const express = require('express');

const router = express.Router();

const speakersRoutes = require('./speakers');
const feedbackRoutes = require('./feedback');

module.exports = (params) => {
  const { speakersService } = params;
  router.get('/', async (req, res, next) => {
    // session is name of cookie, defined in server.js
    // if (!req.session.visitcount) {
    //   req.session.visitcount = 0;
    // }
    // req.session.visitcount += 1;
    // console.log(req.session.visitcount);

    try {
      const topSpeakers = await speakersService.getList();
      res.locals.topSpeakers = topSpeakers;
      console.log(res.locals.topSpeakers);

      // here pageTitle and template are template variables, which are available only for this request and can be used in home.ejs
      res.render('layout/home.ejs', { pageTitle: 'Welcome', template: 'home.ejs' });
      // res.sendFile(path.join(__dirname, './static/index.html'));
    } catch (error) {
      next(error);
    }
  });

  router.use('/speakers', speakersRoutes(params));
  router.use('/feedback', feedbackRoutes(params));

  return router;
};

// module.exports = router;
