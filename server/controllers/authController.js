'use strict';

const mongoose = require('./../db/mongoose');
const User = require('./../models/user');

function postUser(req, res) {
  const {
    body
  } = req;
  const user = new User(body);

  user.save().then((doc) => {
    return user.generateAuthToken();

  }).then(token => {
    res.header('x-auth', token).send(user);
  }).catch(err => res.status(400).send(err));
}

function getUser(req, res) {
  // comes from auth middleware
  res.send(req.user);
}

function getUsers(req, res) {
  User.find({}).then(users => {
    res.send(users);
  }).catch(err => res.status(400).send());
}

function loginUser(req, res) {
  const {
    email,
    password,
  } = req.body;

  User.findByCredentials(email, password).then((user) => {

    return user.generateAuthToken().then(token => {
      res.header('x-auth', token).send(user);
    });
  }).catch(err => {
    return res.status(404).send()
  });

}

function logoutUser(req, res) {
  // req.user and req.token were filled in auth.js middleware
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }).catch(err => res.status(400).send());
}

function modifyUser(req, res) {
  const {
    body,
    token,
  } = req;

  User.findByIdAndChangeData(req.user._id, body).then(user => {

    if (!user) return res.status(404).send();
    if (body.password) {
      // remove token after change password
      req.user.removeToken(token).then(() => {
        res.send({
          message: 'token removed',
        });
      }).catch(err => res.status(400).send());
    } else {
      res.send(user);
    }
  }).catch(err => res.status(400).send());
}

module.exports = {
  postUser,
  getUser,
  getUsers,
  loginUser,
  logoutUser,
  modifyUser,
}