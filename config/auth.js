import bcrypt from 'bcrypt';
import models from '../models/index';

const User = models.User;
const LocalStrategy = require('passport-local').Strategy;

export default function auth(passport) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use(
    new LocalStrategy(async function (username, password, done) {
      const user = await User.sequelize.query('SELECT * FROM users WHERE email=(:user)', {
        replacements: { user: username },
      });

      if (!user) return done(null, false);

      const retrievedPassword = user[0][0].password;

      if (!bcrypt.compare(password, retrievedPassword)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );
}
