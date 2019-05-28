'use strict';

const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const debug = require('debug')('app:models/auth-model');
const { registrationSchema } = require('../helpers/validation-schema');
const connectionProvider = require('../data-access/connection-provider');
const dbSettings = require('../config/db-settings');
const colName = dbSettings.collections.users;

function authModel() {
  /**
   * Validate signup form fields
   * @param req
   * @return {*}
   */
  function validateSignup(req) {
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
      return prunedErrors;
    }

    return false;
  }

  async function addUser(req) {
    // set up user object to be inserted
    const {
      firstname,
      lastname,
      username,
      password,
    } = req.body;
    try {
      const db = await connectionProvider(dbSettings.dbURL, dbSettings.dbName);
      debug('Connected to mongo server');

      // Use users collection
      const col = db.collection(colName);

      // prevent existing email from signing up again
      const existingUser = await col.findOne({ username });
      if (existingUser) {
        return {
          existingUser: true,
        };
      }

      // encrypt password
      const hash = await bcrypt.hashAsync(password, 12);

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
      return results;
    } catch(err) {
      if (err) {
        debug(err.stack);
        return err;
      }
    }
  }

  return {
    validateSignup,
    addUser,
  };
}

module.exports = authModel;
