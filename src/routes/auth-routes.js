'use strict';

const express = require('express');
const authRouter = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth-controller');

/**
 * Routes to Sign Up, signin, logout and view profile pages
 * @param {Object} nav The navigation object
 * @param {String} link The link to the page
 * @param {String} title The page name
 * @return {Router|router}
 */
function router(nav) {
  const { registerUser } = authController(nav);
  authRouter.route('/signup')
    .get((req, res) => {
      res.render(
        'signup',
        {
          nav,
          title: 'Jukebox: Sign Up',
        }
      );
    })
    .post(registerUser);

  authRouter.route('/signin')
    .post(passport.authenticate('local', {
      successRedirect: '/jukebox',
      failureRedirect: '/auth/signInError',
    }));

  authRouter.route('/signInError')
    .get((req, res) => {
      // time out to delay brute force attack
      const delayResponse = response => {
        setTimeout(() => {
          response();
        }, 1000);
      };
      const dataObj = {
        nav,
        title: 'Jukebox',
        errorMessage: 'The combination of email and password is not valid',
      };
      return delayResponse(() => res.render('index', dataObj));
    });

  authRouter.route('/signUpError')
    .get((req, res) => {
      const errorMessage = 'There was a problem with your registration, please try again';
      const dataObj = {
        nav,
        title: 'Jukebox: Sign Up',
        errorMessage,
      };
      res.render('signup', dataObj)
    });

  authRouter.route('/logout')
    .get((req, res) => {
      if (req.user) {
        req.logout();
      }
      res.redirect('/');
    });

  authRouter.route('/profile')
    .all((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/');
      }
    })
    .get((req, res) => {
      res.render(
        'profile',
        {
          nav,
          title: 'Jukebox: profile',
          username: req.user.username,
          email: req.user.email,
          fullname: req.user.fullname,
          firstname: req.user.firstname,
          lastname: req.user.lastname,
        }
      );
    });

  return authRouter;
}

module.exports = router;
