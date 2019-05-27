'use strict';

const express = require('express');
const jukeboxRouter = express.Router();
const jukeboxController = require('../controllers/jukebox-controller');

/**
 * Routes to jukebox and songlist pages
 * @param {Object} nav The navigation object
 * @param {String} link The link to the page
 * @param {String} title The page name
 * @returns {Router|router}
 */
function router(nav) {
  const {
    middleware,
    playJukeBox,
    songList,
    getSongForm,
    addSong,
  } = jukeboxController(nav);

  jukeboxRouter.use(middleware);

  jukeboxRouter.route('/')
    .get(playJukeBox);

  jukeboxRouter.route('/addSong')
    .get(getSongForm)
    .post(addSong);

  jukeboxRouter.route('/songList')
    .get(songList);

  return jukeboxRouter;
}

module.exports = router;
