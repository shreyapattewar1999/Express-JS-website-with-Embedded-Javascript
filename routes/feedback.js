const express = require('express');

const { check, validationResult } = require('express-validator');

const router = express.Router();

const validations = [
  // escape() --> it replace <, >, &, ', " and / with HTML entities.
  check('name').trim().isLength({ min: 3 }).escape().withMessage('A name is required'),
  check('email').trim().isEmail().normalizeEmail().withMessage('A valid email address is required'),
  check('title').trim().isLength({ min: 3 }).escape().withMessage('A title is required'),
  check('message').trim().isLength({ min: 5 }).escape().withMessage('A message is required'),
];

module.exports = (params) => {
  const { feedbackService } = params;

  router.get('/', async (req, res, next) => {
    try {
      const errors = req.session.feedback ? req.session.feedback.errors : false;
      const successMessage = req.session.feedback ? req.session.feedback.message : false;

      req.session.feedback = {};

      const feedbackList = await feedbackService.getList();
      return res.render('layout/home', {
        pageTitle: 'Feedback',
        template: 'feedback',
        feedbackList,
        errors,
        successMessage,
      });
      // return res.json(feedback);
    } catch (error) {
      next(error);
    }
  });

  router.post(
    '/',
    [
      // escape() --> it replace <, >, &, ', " and / with HTML entities.
      check('name').trim().isLength({ min: 3 }).escape().withMessage('A name is required'),
      check('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('A valid email address is required'),
      check('title').trim().isLength({ min: 3 }).escape().withMessage('A title is required'),
      check('message').trim().isLength({ min: 5 }).escape().withMessage('A message is required'),
    ],
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          // here we are checking if there are any errors, we are storing those errors in session cookie and redirecting to feedback page route, where these errors will be fetched from session cookie and sent to ejs file for displaying
          req.session.feedback = { errors: errors.array() };
          return res.redirect('/feedback');
        }

        // req.body is accessible because of body-parser module defined in server.js
        const { name, email, title, message } = req.body;
        await feedbackService.addEntry(name, email, title, message);
        req.session.feedback = { message: 'Thank you for your feedback !!' };
        return res.redirect('/feedback');
      } catch (error) {
        return next(error);
      }
    }
  );

  router.post('/api', validations, async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
      }
      const { name, email, title, message } = req.body;
      await feedbackService.addEntry(name, email, title, message);
      const feedbackList = await feedbackService.getList();
      // res.json({ feedbackList });
      req.session.feedback = { message: 'Thank you for your feedback !!' };
      return res.redirect('/feedback');
      // return res.json({
      //   feedbackList,
      //   successMessage: 'Thank you for your feedback !!, response from api rest',
      // });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
