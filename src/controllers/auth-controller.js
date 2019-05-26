'use strict';

const debug = require('debug')('app:controllers/auth-controller');
const { validateSignup, addUser } = require('../models/auth-model')();

/**
 * Validates the signup form,
 *  registers user in the database,
 *  automatically logs in the user
 *  and redirect to jukebox page
 * @param {Object} nav The navigation object
 * @param {String} link The link to the page
 * @param {String} title The page name
 * @return {{registerUser: registerUser}}
 */
function authController(nav) {
  function registerUser(req, res) {
      debug('Signing up!');

    const validationErrors = validateSignup(req);
    if (validationErrors) {
      const errorObj = {
        nav,
        title: 'Jukebox: Sign Up',
        errors: validationErrors,
      };
      return res.render('signup', errorObj);
    }

    (async function newUser(){
      try {

        const result = await addUser(req);

        if (result.existingUser) {
          const dataObj = {
            nav,
            title: 'Jukebox: Sign Up',
            errorMessage: 'Sorry, we could not complete your sign up',
          };
          return res.render('signup', dataObj);
        }

        req.login(result.ops[0], () => {
          debug('I am signed up after login!');
          res.redirect('/jukebox');
        });
      } catch(err) {
        if (err) {
          debug(err.stack);
          res.redirect('/auth/signUpError');
        }
      }
    }());
  }

  return {
    registerUser,
  };
}

module.exports = authController;
