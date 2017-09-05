'use strict';

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  isEmail
} = require('validator');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    validate: {
      validator(value) {
        // expect to return a boolean
        return isEmail(value);
      }
    },
    message: '{VALUE} no es un email valido',
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
  },
  displayName: String,
  avatar: String,
  signupDate: {
    type: Date,
    default: Date.now(),
  },
  lastLogin: Date,
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  }],
});

// ToJSON is a builtin function from mongoose.methods
// this transform any of our objects to JSON before get
// Save to MongoDB
// In this function we're going to get just the _id and email
// from the posted new user and just return back these two values
// to the user hiding the rest of the information which is private

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  const {
    _id,
    email,
    displayName,
    avatar,
    signupDate,
    lastLogin
  } = userObject;

  return {
    _id,
    email,
    displayName,
    avatar,
    signupDate,
    lastLogin
  }
}

UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
      _id: user._id.toHexString(),
      access,
    },
    process.env.JWT_SECRET
  ).toString();

  user.tokens.push({
    access,
    token,
  });

  return user.save().then(() => {
    return token;
  });
}

UserSchema.methods.removeToken = function (token) {
  const user = this;

  return user.update({
    // $pull remove propeties from arrays
    $pull: {
      tokens: {
        token, // Removes all tokens if  parameter is passed in empty
      }
    }
  })


}

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Reject the promise
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    // or better like this (the same thing)
    return Promise.reject();
  }
  return User.findOne({
    '_id': decoded._id,
    // 'tokens.token': token,
    // 'tokens.access': 'auth',
  });
}

UserSchema.statics.findByCredentials = function (email, password) {
  const user = this;

  return user.findOne({
    email
  }).then(user => {
    if (!user) {
      return Promise.reject();
    }
    // Since bcrypt only support callback functions and we want to use promises
    // We're going to wrap that bcrypt with a new promise 
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject(err);
        }
      });
    });
  });
}

// encrypting our password with bcrypt.js
UserSchema.pre('save', function (next) {
  const user = this;

  // Let's check if the password was modified
  // we'll use a built in method for this

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      // Hashing password
      bcrypt.hash(user.password, salt, (err, hash) => {
        // if the user password is the same as hash then
        // password will have a new value which is the encrypted
        if (bcrypt.compare(user.password, hash)) {
          user.password = hash
          next();
        }
      });
    });
  } else {
    // if nothing was modified then go next
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;