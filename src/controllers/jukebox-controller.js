'use strict';

// const { MongoClient, ObjectID } = require('mongodb');
const formidable = require('formidable');
const fs = require('fs');
const util = require('util');
const debug = require('debug')('app:controllers/jukebox-controller');
const connectionProvider = require('../data-access/connection-provider');
const dbSettings = require('../config/db-settings');
const collectionName = dbSettings.collections.songs;
const { getSongList, createSong } = require('../models/jukebox-model')();
const AUDIO_DIR = '/audio/';

const path = require('path');
const appDir = path.dirname(require.main.filename);

/**
 * Controller for returning a list of songs
 *  either for listing on a page or for playing
 * @param {Object} nav The navigation object
 * @param {String} link The link to the page
 * @param {String} title The page name
 * @returns {{getSongList, playJukeBox, middleware}}
 */
function jukeboxController(nav) {
  function songList(req, res) {
    getSongList()
      .then(songs => {
        const dataObj = {
          nav,
          title: 'Jukebox: Song List',
          songs
        };
        res.render('songList', dataObj);
      })
      .catch(err => {
        debug(err.stack);
      });
  }

  function getSongForm(req, res) {
    res.render(
      'songForm',
      {
        nav,
        title: 'Jukebox: Add Song',
      }
    );
  }

  function addSong(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      createSong(fields, files)
        .then(response => {
          const {
            action,
            newSong: song,
          } = response;

          const actionVerb = action === 'update' ? 'updated' : 'added';
          const message = `The song ${song.title} was successfully ${actionVerb}`;

          const dataObj = {
            nav,
            title: `Jukebox: ${song.title}`,
            songs: [song],
            message,
          };
          res.render('songList', dataObj);
        })
        .catch(error => {
          debug(error);
          const dataObj = {
            nav,
            title: 'Jukebox: Add Song',
            message: error.message,
          };
          res.render('songForm', dataObj);
        });
    });
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
    songList,
    getSongForm,
    addSong,
    playJukeBox,
    middleware,
  };
}

module.exports = jukeboxController;
