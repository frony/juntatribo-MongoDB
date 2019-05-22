'use strict';

const passport = require('passport');
require('./strategies/local.strategy')();
const debug = require('debug')('app:passport');

function passportConfig(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  // stores user in a session
  passport.serializeUser((user, done) => {
    // done(null, user);
    const userProfile = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.username,
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
