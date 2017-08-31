'use strict';

const {
  Schema,
  model
} = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  isEmail
} = require('validator');

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, 'El campo Email es requerido'],
    trim: true,
    unique: true,
    minlength: 1,
    validate: isEmail,
    message: '{VALUE} no es un email valido',
    lowercase: true,
  },
  displayName: String,
  avatar: String,
  password: {
    type: String,
    required: [true, 'El campo password es Requerido'],
    trim: true,
    minlength: 6,
  },
  signupDate: {
    type: Date,
    default: Date.now(),
  },
  lastLogin: Date,
  token: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    }
  }]
});

const User = model('User', UserSchema);

module.exports = User;