'use strict';

module.exports = {
  dbURL: 'mongodb://localhost:27017',
  dbName: 'jukebox',
  collections: {
    users: 'users',
    songs: 'songs',
    session: 'connect_mongodb_session',
  },
};
