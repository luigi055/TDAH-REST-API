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

function changeData(req, res) {

}

module.exports = {
  postUser,
  getUser,
  loginUser,
  logoutUser,
}