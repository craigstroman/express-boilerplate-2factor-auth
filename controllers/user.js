import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import models from '../models/index';

const User = models.User;

export const join = async (req, res) => {
  console.log('join: ');
  const secret = authenticator.generateSecret();
  const { body } = req;
  const { first_name, last_name, email, password } = body;
  const encryptedPassword = await bcrypt.hash(password, 5);

  const newUser = new User({
    first_name,
    last_name,
    email,
    password: encryptedPassword,
    secret,
  });

  newUser
    .save()
    .then((resp) => {
      QRCode.toDataURL(authenticator.keyuri(email, '2 Factor Auth Express App', secret), (err, url) => {
        if (err) {
          throw err;
        }

        req.session.qr = url;
        req.session.email = email;
        res.redirect('/sign-up-2fa');
      });
    })
    .catch((err) => {
      console.log('error: ', err);
      res
        .status(500)
        .send({
          error: err,
        })
        .end();
    });
};

export const create2FA = (req, res) => {
  if (!req.session.qr) {
    res.redirect('/');
  }

  res.render('signup-2fa', { qr: req.session.qr });
};

export const signup2FA = (req, res) => {
  if (!req.session.email) {
    return res.redirect('/');
  }

  const email = req.session.email;
  const code = req.body.code;

  verifyLogin(email, code, req, res, '/sign-up-2fa');
};

export const verifyLogin = async (email, code, req, res, failUrl) => {
  const user = await User.sequelize.query('SELECT * FROM users WHERE email=(:user)', {
    replacements: { user: email },
  });

  try {
    const { secret } = user[0][0];

    if (!authenticator.check(code, secret)) {
      return res.redirect(failUrl);
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.log('error: ', error);
  }
};

export const login = (req, res) => {
  const { user } = req;
  const { first_name, last_name, email } = user[0][0];

  res.render('dashboard', { first_name, last_name, email });
};

export const logout = (req, res) => {
  req.logout();

  req.session.destroy(function (err) {
    res.render('logout', {
      title: req.app.locals.title,
      content: req.app.locals.content,
      path: req.path,
    });
  });
};
