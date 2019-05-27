'use script';

const Promise = require('bluebird');

const debug = require('debug')('app:models/jukebox-model');
const connectionProvider = require('../data-access/connection-provider');
const dbSettings = require('../config/db-settings');
const dbURL = dbSettings.dbURL;
const dbName = dbSettings.dbName;
const colName = dbSettings.collections.songs;

const path = require('path');
const appDir = path.dirname(require.main.filename);
const AUDIO_PATH = `${appDir}/public/audio`;

const { promisify } = require('util');
const fs = require('fs');
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

function jukeboxModel() {
  async function getSongList() {
    try {
      const db = await connectionProvider(dbURL, dbName);
      const col = await db.collection(colName);
      const songs = await col.find().toArray();
      return songs;
    } catch(err) {
      debug(err.stack);
    }
  }

  async function createSong(fields, files) {
    return new Promise((resolve, reject) => {
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
            const col = await db.collection(colName);

            const arrGenre = fields.genre.split(',').map(item => item.trim());
            const arrTags = fields.tags.split(',').map(item => item.trim());

            const song = {
              title: fields.title,
              artist: fields.artist,
              genre: arrGenre,
              arrTags: arrTags,
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

            let action = 'update';
            if (result.upsertedCount === 1) {
              action = 'insert';
            }

            const newSong = await col.findOne({ 'file.fileName': files.file.name });
            const response = {
              action,
              newSong,
            };

            // return song result
            resolve(response);
          }
          reject({message: 'There was a problem uploading the file and saving the song'});
        } catch(err) {
          debug(err);
          reject({message: 'There was a problem uploading the file and saving the song'});
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
