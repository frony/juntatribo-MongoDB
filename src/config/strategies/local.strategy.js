'use strict';

const passport = require("passport");
const { Strategy } = require('passport-local');
const connectionProvider = require('../../data-access/connection-provider');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const debug = require('debug')('app:dbSettings/strategies/local.strategy');
const dbSettings = require('../db-settings');
const colName = dbSettings.collectionUsersName;

/**
 * Local strategy for passport
 */
function localStrategy() {
  passport.use(new Strategy({
    usernameField: 'username',
    passwordField: 'password',
  }, (username, password, done) => {
    (async function mongo() {
      try {
        const db = await connectionProvider(dbSettings.dbURL, dbSettings.dbName);
        debug('Connected correctly to server');

        const col = db.collection(colName);

        const user = await col.findOne({ username });

        if (user && user.password) {
          const passwordIsValid = await bcrypt.compareAsync(password, user.password);
          if (passwordIsValid) {
            const userProfile = {
              firstname: user.firstname,
              lastname: user.lastname,
              fullname: `${user.firstname} ${user.lastname}`,
              username: user.username,
              email: user.username,
            };
            done(null, userProfile);
          } else {
            done(null, false);
          }
        } else {
          done(null, false);
        }
      } catch(err) {
        console.log(err.stack); // TODO: use winston
      }
    }());
  }));
}

module.exports = localStrategy;
