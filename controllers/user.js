import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import models from '../models/index';

const User = models.User;

export const join = async (req, res) => {
  const secret = authenticator.generateSecret();
  const { body, session } = req;
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

        session.qr = url;
        session.email = email;
        session.firstName = first_name;
        session.lastName = last_name;

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
  const { body, session } = req;
  const { code } = body;
  const { email } = session;

  if (!email) {
    return res.redirect('/');
  }

  const validate2FA = verifyLogin(email, code, req, res, '/sign-up-2fa');

  if (validate2FA) {
    res.redirect('/dashboard');
  }
};

export const login = (req, res) => {
  const { user, session } = req;
  const { first_name, last_name, email } = user[0][0];

  if (user) {
    session.firstName = first_name;
    session.lastName = last_name;
    session.email = email;

    res.render('2fa');
  } else {
    res.render('login');
  }
};

export const verify2Factor = async (req, res) => {
  const { body, session } = req;
  const { code } = body;
  const { email } = session;

  const validateLogin = await verifyLogin(email, code, req, res, '/signin');

  if (validateLogin) {
    res.redirect('dashboard');
  } else {
    res.render('login');
  }
};

export const logout = (req, res) => {
  req.session.destroy(function (err) {
    res.render('logout', {
      title: req.app.locals.title,
      content: req.app.locals.content,
      path: req.path,
    });
  });

  req.logout();
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
    return true;
  } catch (err) {
    console.log('error: ', error);

    return false;
  }
};
