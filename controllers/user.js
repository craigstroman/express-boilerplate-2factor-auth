import bcrypt from 'bcrypt';
import models from '../models/index';

const User = models.User;

export const join = async (req, res) => {
  const { body } = req;
  const { first_name, last_name, email, password } = body;
  const encryptedPassword = await bcrypt.hash(password, 5);

  const newUser = new User({
    first_name,
    last_name,
    email,
    password: encryptedPassword,
  });

  newUser
    .save()
    .then((resp) => {
      console.log('success: ');
      res.send(resp);
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

export const login = (req, res) => {
  const { user } = req;

  res.json(user);
};

export const logout = (req, res) => {
  req.logout();

  res.render('logout', {
    title: req.app.locals.title,
    content: req.app.locals.content,
    path: req.path,
  });
};
