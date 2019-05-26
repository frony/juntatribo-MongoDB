'use strict';

const { MongoClient } = require('mongodb');
const Promise = require('bluebird');
const debug = require('debug')('app:data-access/connection-provider')

const _internalConnectionPool = {};

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
