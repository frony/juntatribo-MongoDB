'use strict';

const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const sessionManagement = require('./src/config/session-management');
const expressLayouts = require('express-ejs-layouts');
const expressValidator = require('express-validator');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3333;
const nav = require('./src/config/navigation')();

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
sessionManagement(app);

require('./src/config/passport.js')(app);

app.use(express.static(path.join(__dirname, '/public/')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use(expressLayouts);
app.use(cors());

app.set('views', './src/views');
app.set('view engine', 'ejs');

const authRouter = require('./src/routes/auth-routes')(nav);
const jukeboxRouter = require('./src/routes/jukebox-routes')(nav);

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
