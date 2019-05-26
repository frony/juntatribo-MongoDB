'use strict';

const passport = require('passport');
require('./strategies/local.strategy')();
const debug = require('debug')('app:passport');

/**
 * Stores user in a session
 * and retrieves user from session
 * @param {Object} app
 */
function passportConfig(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  // stores user in a session
  passport.serializeUser((user, done) => {
    const userProfile = {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
    };
    done(null, userProfile);
  });

  // retrieves user from session
  passport.deserializeUser((user, done) => {
    debug(user);
    done(null, user);
  });
}

module.exports = passportConfig;
