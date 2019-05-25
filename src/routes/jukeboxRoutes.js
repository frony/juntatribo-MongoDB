'use strict';

const express = require('express');
const jukeboxRouter = express.Router();
const debug = require('debug')('app:jukebox');
const jukeboxController = require('../controllers/jukeboxController');

function router(nav) {
  const { middleware, playJukeBox, getSongList } = jukeboxController(nav);
  jukeboxRouter.use(middleware);
  jukeboxRouter.route('/')
    .get(playJukeBox);

  jukeboxRouter.route('/songlist')
    .get(getSongList);

  return jukeboxRouter;
}

module.exports = router;
