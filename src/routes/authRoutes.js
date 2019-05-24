'use strict';

const express = require('express');
const authRouter = express.Router();
const { MongoClient } = require('mongodb');
const passport = require('passport');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require("bcrypt"));
const debug = require('debug')('app:authRoutes');
const config = require('../config/db.json');
const { registrationSchema } = require('../helpers/validationSchema');

function router(nav) {
  authRouter.route('/signup')
    .get((req, res) => {
      res.render(
        'signup',
        {
          nav,
          title: 'Jukebox: Sign Up',
        }
      );
    })
    .post((req, res) => {
      debug('Signing up!');
      const {
        firstname,
        lastname,
        username,
        password,
      } = req.body;

      // validate form
      req.checkBody(registrationSchema);
      const errors = req.validationErrors();
      debug(errors);

      if (errors) {
        const arrAcc = [];
        const prunedErrors = errors.map(err => {
          const param = err.param;
          if (!arrAcc.includes(param)) {
            arrAcc.push(param);
            return err;
          }
        }).filter(err => typeof err !== "undefined");
        debug(prunedErrors);
        const errorObj = {
          nav,
          title: 'Jukebox: Sign Up',
          errors: prunedErrors,
        };
        return res.render('signup', errorObj);
      }

      // set up mongo stuff
      const url = config.dbURL;
      const dbName = config.dbName;
      const colName = config.collectionUsersName;

      (async function addUser(){
        let client;
        try {
          client = await MongoClient.connect(url, { useNewUrlParser: true } );
          debug('Connected to mongo server');

          // Use jukebox database
          const db = client.db(dbName);

          // Use users collection
          const col = db.collection(colName);

          // prevent existing email from signing up again
          const existingUser = await col.findOne({ username });
          if (existingUser) {
            const dataObj = {
              nav,
              title: 'Jukebox: Sign Up',
              errorMessage: 'Sorry, we could not complete your sign up',
            };
            return res.render('signup', dataObj);
          }

          // encrypt password
          const hash = await bcrypt.hashAsync(password, 12);

          // set up user object to be inserted
          const user = {
            firstname,
            lastname,
            username,
            email: username,
            password: hash,
            created: Date.now(),
          };

          // insert user into DB
          const results = await col.insertOne(user);
          debug(results);
          req.login(results.ops[0], () => {
            debug('I am signed up after login!');
            res.redirect('/jukebox');
          });
        } catch(err) {
          if (err) {
            debug(err.stack);
          }
        }
      }());
    });

  authRouter.route('/signin')
    .post(passport.authenticate('local', {
      successRedirect: '/jukebox',
      failureRedirect: '/auth/signInError',
    }));

  authRouter.route('/signInError')
    .get((req, res) => {
      // time out to delay brute force attack
      const delayResponse = response => {
        setTimeout(() => {
          response();
        }, 1000);
      };
      const dataObj = {
        nav,
        title: 'Jukebox',
        errorMessage: 'The combination of email and password is not valid',
      };
      return delayResponse(() => res.render('index', dataObj));
    });

  authRouter.route('/logout')
    .get((req, res) => {
      if (req.user) {
        req.logout();
      }
      res.redirect('/');
    });

  authRouter.route('/profile')
    .all((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/');
      }
    })
    .get((req, res) => {
      res.render(
        'profile',
        {
          nav,
          title: 'Jukebox: profile',
          username: req.user.username,
          email: req.user.email,
          fullname: req.user.fullname,
          firstname: req.user.firstname,
          lastname: req.user.lastname,
        }
      );
    });

  return authRouter;
}

module.exports = router;
