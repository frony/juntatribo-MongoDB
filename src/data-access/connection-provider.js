'use strict';

const { MongoClient } = require('mongodb');
const Promise = require('bluebird');
const debug = require('debug')('app:data-access/connection-provider')

const _internalConnectionPool = {};

/**
 * Creates a pool of mongodb connections
 *  and return a mongodb connection as a promise
 * @param {String} url The mongodb server URL
 * @param {String} database The mongodb database to connect to
 * @param {Object} options Custom connection configuration
 * @return Promise
 */
function connectionProvider(url, database, options) {
  const opts = Object.assign({}, {
    useNewUrlParser: true,
  }, options);

  return new Promise((resolve, reject) => {
    const address = `${url}/${database}`;
    if (!(_internalConnectionPool[address])) {
      (async function getDB() {
        let client;
        try {
          client = await MongoClient.connect(url, opts);
          const db = client.db(database);
          debug('Connected to mongo server');

          _internalConnectionPool[address] = db;
          resolve(_internalConnectionPool[address]);
        } catch (err) {
          reject(err)
        }
      }());
    } else {
      return resolve(_internalConnectionPool[address]);
    }
  });
}

module.exports = connectionProvider;
