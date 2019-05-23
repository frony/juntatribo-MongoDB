'use strict';

const passport = require("passport");
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:local.strategy');
const config = require('../db.json');

function localStrategy() {
  passport.use(new Strategy({
    usernameField: 'username',
    passwordField: 'password',
  }, (username, password, done) => {
    const url = config.dbURL;
    const dbName = config.dbName;
    const colName = config.collectionUsersName;
    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url);
        debug('Connected correctly to server');

        const db = client.db(dbName);
        const col = db.collection(colName);

        const user = await col.findOne({ username });

        if (user && user.password && user.password === password) {
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
      } catch(err) {
        console.log(err.stack); // TODO: use winston
      }

      // close connection
      client.close();
    }());
  }));
}

module.exports = localStrategy;
