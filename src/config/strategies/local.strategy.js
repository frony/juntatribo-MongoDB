'use strict';

const passport = require("passport");
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:local.strategy');

function localStrategy() {
  passport.use(new Strategy({
    usernameField: 'username',
    passwordField: 'password',
  }, (username, password, done) => {
    const url = 'mongodb://localhost:27017'; // TODO: get it from a config file
    // const dbName = 'sandbox';
    const dbName = 'jukebox'; // TODO: get it from a config file
    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url);
        debug('Connected correctly to server');

        const db = client.db(dbName);
        const col = db.collection('users'); // TODO: get it from a config file

        const user = await col.findOne({ username });

        if (user && user.password && user.password === password) {
          const userProfile = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.username,
          };
          done(null, userProfile);
        } else {
          done(null, false);
        }
      } catch(err) {
        console.log(err.stack); // TODO: use winston
      }

      // close connection
      client.close();
    }());
  }));
}

module.exports = localStrategy;
