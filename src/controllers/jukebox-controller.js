'use strict';

// const { MongoClient, ObjectID } = require('mongodb');
const formidable = require('formidable');
const debug = require('debug')('app:controllers/jukebox-controller');
const { validateSongForm } = require('../helpers/form-validation')();
const { getSongList, createSong } = require('../models/jukebox-model')();
const AUDIO_DIR = '/audio/';

/**
 * Controller for:
 *  - returning a list of songs
 *  - send a playlist to the music player
 * @param {Object} nav The navigation object
 * @param {String} link The link to the page
 * @param {String} title The page name
 * @returns {{getSongList, playJukeBox, middleware}}
 */
function jukeboxController(nav) {
  /**
   * Display a list of songs
   * @param req
   * @param res
   */
  function songList(req, res) {
    getSongList(req.query)
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

  /**
   * Render form to add song
   * @param req
   * @param res
   */
  function getAddSongForm(req, res) {
    res.render(
      'songForm',
      {
        nav,
        title: 'Jukebox: Add Song',
      }
    );
  }

  /**
   * Upload a music file
   *  and upsert a song into the database
   * @param req
   * @param res
   */
  function addSong(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if (err) {
        throw err;
      }

      // validate form
      const validationErrors = validateSongForm(fields, files.file);
      debug(validationErrors);
      if (validationErrors && validationErrors.length > 0) {
        const errorObj = {
          nav,
          title: 'Jukebox: Add Song',
          errors: validationErrors,
        };
        return res.render('songForm', errorObj);
      }

      // form was validated
      // song entry can be created
      createSong(fields, files)
        .then(response => {
          const {
            resultAction,
            newSong: song,
          } = response;

          const actionVerb = resultAction === 'update' ? 'updated' : 'added';
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

  /**
   * Play a playlist in the music player
   * @param req
   * @param res
   */
  function playJukeBox(req, res) {
    getSongList(req.query)
      .then(songs => {
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
      })
      .catch(err => {
        debug(err.stack);
        const dataObj = {
          nav,
          title: 'Jukebox: Music Player',
          errorMessage: err,
        };
        res.render('songList', dataObj);
      });
  }

  /**
   * Verify if user is still logged in
   * @param req
   * @param res
   * @param next
   */
  function middleware(req, res, next) {
    if (req.user) {
      next()
    } else {
      res.redirect('/');
    }
  }

  return {
    songList,
    getAddSongForm,
    addSong,
    playJukeBox,
    middleware,
  };
}

module.exports = jukeboxController;
