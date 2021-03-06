'use script';

const Promise = require('bluebird');
const debug = require('debug')('app:models/jukebox-model');
const connectionProvider = require('../data-access/connection-provider');
const dbSettings = require('../config/db-settings');
const dbURL = dbSettings.dbURL;
const dbName = dbSettings.dbName;
const songsColName = dbSettings.collections.songs;
const playListColName = dbSettings.collections.playlists;

const path = require('path');
const appDir = path.dirname(require.main.filename);
const AUDIO_PATH = `${appDir}/public/audio`;

const { promisify } = require('util');
const fs = require('fs');
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

function jukeboxModel() {
  /**
   * Get a list of songs
   * @return {Promise<void>}
   */
  async function getSongList(query, colName=songsColName) {
    try {
      const db = await connectionProvider(dbURL, dbName);
      const col = await db.collection(colName);
      return await col.find(query).toArray();
    } catch(err) {
      debug(err.stack);
    }
  }

/*  function createPlaylist() {

  }*/

  /**
   * Upload a music file
   *  and upsert a song into the database
   * @param {Object} fields
   * @param {Object} files
   * @return {Promise<void>}
   */
  async function createSong(fields, files) {
    return new Promise((resolve, reject) => {
      if (files.file.size < 1) {
        throw Error('There was a problem uploading the file and saving the song');
      }
      const oldpath = files.file.path;
      const newpath = `${AUDIO_PATH}/${files.file.name}`;

      (async function addSong() {
        // check if AUDIO_PATH exists
        try {
          const stats = await stat(AUDIO_PATH);
          debug(stats);
        } catch(err) {
          // create AUDIO_PATH if it doesn't exist
          await mkdir(AUDIO_PATH);
        }

        try {
          // upload file to AUDIO_PATH
          const isUploaded = rename(oldpath, newpath);

          // add song to database
          if (isUploaded) {
            const db = await connectionProvider(dbURL, dbName);
            const col = await db.collection(songsColName);

            const arrGenre = fields.genre.split(',').map(item => item.trim());
            const arrTags = fields.tags.split(',').map(item => item.trim());

            const song = {
              title: fields.title,
              artist: fields.artist,
              genre: arrGenre,
              tags: arrTags,
              file: {
                fileName: files.file.name,
                size: files.file.size,
                type: files.file.type,
                hash: files.file.hash,
                lastModifiedDate: files.file.lastModifiedDate,
              },
              createdAt: Date.now(),
            };
            const result = await col.updateOne(
              { 'file.fileName': files.file.name },
              { $set: song },
              { upsert: true }
            );
            debug(result);

            let resultAction = 'update';
            if (result.upsertedCount === 1) {
              resultAction = 'insert';
            }

            const newSong = await col.findOne({ 'file.fileName': files.file.name });
            const response = {
              resultAction,
              newSong,
            };

            // return song result
            resolve(response);
          }
          reject(Error('There was a problem uploading the file and saving the song'));
        } catch(err) {
          debug(err);
          reject(err);
        }

      }());
    });
  }

  return {
    getSongList,
    createSong,
  };
}

module.exports = jukeboxModel;
