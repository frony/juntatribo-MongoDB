'use strict';

const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const config = require('./src/config/common.json');
const expressValidator = require('express-validator');
const app = express();
const port = process.env.PORT || 3333;

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

require('./src/config/passport.js')(app);

app.use(express.static(path.join(__dirname, '/public/')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use(expressLayouts);

app.set('views', './src/views');
app.set('view engine', 'ejs');

const nav = [
  { link: '/jukebox', title: 'Music Player' },
  { link: '/jukebox/songlist', title: 'Song List' },
  { link: '/auth/profile', title: 'User Profile' }, // TODO: create profile router and move it out of auth profile
  { link: '/auth/logout', title: 'Log Out' },
];

const authRouter = require('./src/routes/authRoutes')(nav);
const jukeboxRouter = require('./src/routes/jukeboxRoutes')(nav);

app.use('/auth', authRouter);
app.use('/jukebox', jukeboxRouter);

app.get('/', (req, res) => {
  res.render(
    'index',
    {
      nav,
      title: 'Jukebox'
    }
  );
});

app.listen(port, () => {
  debug(`listening on port ${chalk.green(port)}`);
});
