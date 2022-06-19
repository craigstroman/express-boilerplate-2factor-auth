export const indexPage = (req, res) => {
  res.render('index', {
    title: req.app.locals.title,
    content: req.app.locals.content,
    path: req.path,
  });
};

export const loginPage = (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('login', {
      title: req.app.locals.title,
      content: req.app.locals.content,
      path: req.path,
    });
  }
};

export const signupPage = (req, res) => {
  res.render('signup', {
    title: req.app.locals.title,
    content: req.app.locals.content,
    path: req.path,
  });
};

export const dashboardPage = (req, res) => {
  if (req.session.email) {
    res.render('dashboard', {
      title: req.app.locals.title,
      content: req.app.locals.content,
      path: req.path,
      first_name: req.session.firstName,
      last_name: req.session.lastName,
      email: req.session.email,
    });
  } else {
    res.redirect('/login');
  }
};
