const User = require('./../models/user');

const authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then(user => {
    // we can just pass like this
    // if (!user) return res.status(401).send();
    // or reject the promise and pass to the catch
    // status at once
    // console.log(user);
    if (!user) return Promise.reject();

    // res.send(user);
    // We will use the user we found in the route
    req.user = user;
    req.token = token;
    next();
  }).catch(err => {
    // 401 error unauthorized
    res.status(401).send();
  });
}

module.exports = authenticate;