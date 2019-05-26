'use strict';

const debug = require('debug')('app:controllers/jukebox-controller');
const connectionProvider = require('../data-access/connection-provider');
const dbSettings = require('../config/db-settings');
const collectionName = dbSettings.collectionSongsName;
const AUDIO_DIR = '/audio/';

/**
 * Controller for returning a list of songs
 *  either for listing on a page or for playing
 * @param {Object} nav The navigation object
 * @param {String} link The link to the page
 * @param {String} title The page name
 * @returns {{getSongList, playJukeBox, middleware}}
 */
function jukeboxController(nav) {
  function getSongList(req, res) {
    (async function mongo(){
      try {
        const db = await connectionProvider(dbSettings.dbURL, dbSettings.dbName);
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
          title: 'Jukebox: Song List',
          playlist
        };
        res.render('songlist', dataObj);
      } catch(err) {
        debug(err.stack);
      }
    }());
  }

  function playJukeBox(req, res) {
    (async function mongo(){
      try {
        const db = await connectionProvider(dbSettings.dbURL, dbSettings.dbName);
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
    playJukeBox,
    middleware,
  };
}

module.exports = jukeboxController;
