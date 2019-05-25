'use strict';

// const { MongoClient, ObjectID } = require('mongodb');
const connectionProvider = require('../data-access/connection-provider');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const debug = require('debug')('app:contropllers/auth-controller');
const dbSettings = require('../config/db-settings');
const { registrationSchema } = require('../helpers/validation-schema');
const colName = dbSettings.collectionUsersName;

function authController(nav) {
  function registerUser(req, res) {
    debug('Signing up!');
    const {
      firstname,
      lastname,
      username,
      password,
    } = req.body;

    // validate form
    req.checkBody(registrationSchema);
    const errors = req.validationErrors();
    debug(errors);

    if (errors) {
      const arrAcc = [];
      const prunedErrors = errors.map(err => {
        const param = err.param;
        if (!arrAcc.includes(param)) {
          arrAcc.push(param);
          return err;
        }
      }).filter(err => typeof err !== "undefined");
      debug(prunedErrors);
      const errorObj = {
        nav,
        title: 'Jukebox: Sign Up',
        errors: prunedErrors,
      };
      return res.render('signup', errorObj);
    }

    (async function addUser(){
      try {
        const db = await connectionProvider(dbSettings.dbURL, dbSettings.dbName);
        debug('Connected to mongo server');

        // Use users collection
        const col = db.collection(colName);

        // prevent existing email from signing up again
        const existingUser = await col.findOne({ username });
        if (existingUser) {
          const dataObj = {
            nav,
            title: 'Jukebox: Sign Up',
            errorMessage: 'Sorry, we could not complete your sign up',
          };
          return res.render('signup', dataObj);
        }

        // encrypt password
        const hash = await bcrypt.hashAsync(password, 12);

        // set up user object to be inserted
        const user = {
          firstname,
          lastname,
          username,
          email: username,
          password: hash,
          created: Date.now(),
        };

        // insert user into DB
        const results = await col.insertOne(user);
        debug(results);
        req.login(results.ops[0], () => {
          debug('I am signed up after login!');
          res.redirect('/jukebox');
        });
      } catch(err) {
        if (err) {
          debug(err.stack);
        }
      }
    }());
  }

  return {
    registerUser,
  };
}

module.exports = authController;
