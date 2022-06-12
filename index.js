import bodyParser from 'body-parser';
import path from 'path';
import http from 'http';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import auth from './config/auth';
import models from './models/index';
import router from './routes/index';

require('dotenv').config();

const PORT = process.env.PORT || 8081;
const app = express();

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

// public directory for scripts, images, etc.
app.use('/static', express.static('public'));

// constant variables for use on views
app.locals.title = 'Express Boilerplate';
app.locals.description = 'A Simple Express Boilerplate';

// bodyParser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// passport
auth(passport); // pass passport for configuration
app.use(session({ secret: process.env.SECRET }));
app.use(passport.initialize());
app.use(passport.session());

app.use(router);

const httpServer = http.createServer(app);

models.sequelize.sync().then(() => {
  httpServer.listen(PORT, () => {
    console.log('The server started on port ' + PORT);
  });
});
