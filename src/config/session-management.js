'use strict';

const session = require('express-session');
const MongoDBStoreFactory = require('connect-mongodb-session');
const connectionProvider = require('../data-access/connection-provider');
const dbSettings = require('./db-settings');
const config = require('./common.json');
const debug = require('debug')('app:config/session-management');

function sessionManagementConfig(app) {
  session.Session.prototype.login = (user) => {
    req.userInfo = user;
  };

  const MongoDBStore = MongoDBStoreFactory(session);

  const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions',
    ttl:  1000 * 60 * 60,
  });

  // Catch errors
  store.on('error', function(error) {
    debug(error);
  });

  app.use(session({
    store,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: '/',
      httpOnly: false,
      secure: false,
      maxAge: 1000 * 60 * 60,
      name: 'tribo'
    },
  }));
}

module.exports = sessionManagementConfig;
