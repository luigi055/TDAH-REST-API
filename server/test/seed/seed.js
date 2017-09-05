const {
  ObjectID
} = require('mongodb');
const jwt = require('jsonwebtoken');
const mongoose = require('./../../db/mongoose');
const User = require('./../../models/user');
const Patient = require('./../../models/patient');

// User seed data

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'test01@example.com',
  password: '123abc!',
  displayName: 'John Doe',
  avatar: null,
  signupDate: 1504461525129,
  lastLogin: 1504461525129,
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userOneId.toHexString(),
      access: 'auth',
    }, process.env.JWT_SECRET).toString(),
  }],
}, {
  _id: userTwoId,
  email: 'test02@example.com',
  password: '123abc!',
  displayName: 'Jane Doe',
  avatar: null,
  signupDate: 1504461525129,
  lastLogin: 1504461525129,
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userOneId.toHexString(),
      access: 'auth',
    }, process.env.JWT_SECRET).toString(),
  }],
}];


function populateUsers(done) {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
}

module.exports = {
  users,
  populateUsers
};