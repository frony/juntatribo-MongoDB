'use strict';

const express = require('express');
const authRouter = express.Router();
const { MongoClient } = require('mongodb');
const passport = require('passport');
const debug = require('debug')('app:authRoutes');

function router(nav) {
  authRouter.route('/signup')
    .post((req, res) => {
      debug('Signing up!');
      const {
        firstname,
        lastname,
        username,
        password,
      } = req.body;
      const url = 'mongodb://localhost:27017';
      const dbName = 'sandbox'; // TODO: get this from a config file
      // const dbName = 'jukebox'; // TODO: get this from a config file
      const colName = 'users'; // TODO: get this from a config file

      (async function addUser(){
        let client;
        try {
          client = await MongoClient.connect(url, { useNewUrlParser: true } );
          debug('Connected to mongo server');

          // Use jukebox database
          const db = client.db(dbName);

          // Use users collection
          const col = db.collection(colName);

          // set up user object to be inserted
          const user = {
            firstname,
            lastname,
            username,
            password,
          };

          // insert user into DB
          const results = await col.insertOne(user);
          debug(results);
          res.send('I am signed up again!');
/*          req.login(results.ops[0], () => {
            res.send('I am signed up again!');
          });*/
        } catch(err) {
          if (err) {
            debug(err.stack);
          }
        }
      }());
    });

  return authRouter;
}

module.exports = router;
