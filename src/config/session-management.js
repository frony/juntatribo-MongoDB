'use strict';

const session = require('express-session');
const MongoDBStoreFactory = require('connect-mongodb-session');
const dbSettings = require('./db-settings');
const config = require('./common.json');
const debug = require('debug')('app:config/session-management');

/**
 * Session middleware that sets mongodb as the session store
 * @param{Object} app
 */
function sessionManagementConfig(app) {
  session.Session.prototype.login = (user) => {
    req.userInfo = user;
  };

  const MongoDBStore = MongoDBStoreFactory(session);

  const store = new MongoDBStore({
    uri: `${dbSettings.dbURL}/${dbSettings.collections.session}`,
    collection: 'mySessions',
    ttl:  1000 * 60 * 60,
  },
  (error) => {
    debug(error);
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
