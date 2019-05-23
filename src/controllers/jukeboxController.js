'use strict';

const { MongoClient, ObjectID } = require('mongodb');
const debug = require('debug')('app:jukeboxController');

const AUDIO_DIR = '/audio/';


function jukeboxController(nav) {
  function getSongList(req, res) {
    const url = 'mongodb://localhost:27017';
    const dbName = 'jukebox';
    const collectionName = 'songs';

    (async function mongo(){
      let client;
      try {
        client = await MongoClient.connect(url);
        const db = client.db(dbName);
        const col = await db.collection(collectionName);
        const songs = await col.find().toArray();
        const playlist = {
          name: 'test',
          tags: [],
          list: {
            default: songs[0],
            all: songs,
          },
          fileDir: AUDIO_DIR,
        };
        const dataObj = {
          nav,
          title: 'Jukebox: Music Player',
          playlist
        };
        res.render('jukebox', dataObj);
      } catch(err) {
        debug(err.stack);
      }
    }());
  }

  function middleware(req, res, next) {
    if (req.user) {
      next()
    } else {
      res.redirect('/');
    }
  }

  return {
    getSongList,
    middleware,
  };
}

module.exports = jukeboxController;
