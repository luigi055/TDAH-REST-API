"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { isEmail } = require("validator");

const UserSchema = new Schema({
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
    message: "{VALUE} no es un email valido",
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  displayName: String,
  avatar: String,
  workplace: String,
  location: String,
  signupDate: {
    type: Number,
    default: new Date().getTime()
  },
  lastLogin: Number,
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ],
  patients: [
    {
      type: Schema.Types.ObjectId,
      ref: "Patient"
    }
  ]
});

// ToJSON is a builtin function from mongoose.methods
// this transform any of our objects to JSON before get
// Save to MongoDB
// In this function we're going to get just the _id and email
// from the posted new user and just return back these two values
// to the user hiding the rest of the information which is private

UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  const {
    _id,
    email,
    displayName,
    confirmed,
    avatar,
    workplace,
    location,
    signupDate,
    lastLogin,
    patients
  } = userObject;

  return {
    _id,
    email,
    displayName,
    confirmed,
    avatar,
    workplace,
    location,
    signupDate,
    lastLogin,
    patients
  };
};

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = "auth";
  const token = jwt
    .sign(
      {
        _id: user._id.toHexString(),
        access
      },
      process.env.JWT_SECRET
    )
    .toString();

  // Update last login
  user.lastLogin = new Date().getTime();
  user.tokens.push({
    access,
    token
  });

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function(token) {
  const user = this;

  return user.update({
    // $pull remove propeties from arrays
    $pull: {
      tokens: {
        token // Removes all tokens if  parameter is passed in empty
      }
    }
  });
};

UserSchema.statics.findByIdAndChangeData = function(id, doc, currentPassword) {
  const User = this;
  doc.currentPassword = doc.currentPassword || ""; // compareSync just accepts strings as parameters
  // to make any change you need first to introduce your current password
  // check current password
  if (!bcrypt.compareSync(doc.currentPassword, currentPassword)) {
    return Promise.reject({
      error: "wrong password",
      status: 401
    });
  }

  // End check current password
  if (doc.password) {
    const trimmedpassword = doc.password.trim();
    if (trimmedpassword.length < 6) {
      return Promise.reject({
        error: "invalid password this should be greater than 5 character"
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(trimmedpassword, salt);
    if (bcrypt.compareSync(trimmedpassword, hash)) {
      doc.password = hash;
    }
  }

  return User.findByIdAndUpdate(
    id,
    {
      $set: doc
    },
    {
      $new: true
    }
  );
};

UserSchema.statics.findByToken = function(token) {
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
    _id: decoded._id
    // 'tokens.token': token,
    // 'tokens.access': 'auth',
  });
};

UserSchema.statics.findByEmailTokenAndConfirm = function(token) {
  const User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.EMAIL_SECRET);
  } catch (err) {
    return Promise.reject();
  }

  return User.findByIdAndUpdate(decoded._id, {
    $set: {
      confirmed: true
    }
  });
};

UserSchema.statics.findByEmailTokenAndChangePassword = function(
  token,
  doc,
  currentPassword
) {
  const User = this;
  var decoded;
  doc.currentPassword = doc.currentPassword || ""; // compareSync just accepts strings as parameters

  try {
    decoded = jwt.verify(token, process.env.EMAIL_SECRET);
  } catch (err) {
    return Promise.reject({
      error: "error when trying to verify token",
      status: 404
    });
  }

  if (doc.currentPassword) {
    // check current password
    if (!bcrypt.compareSync(doc.currentPassword, currentPassword)) {
      return Promise.reject({
        error: "wrong password",
        status: 401
      });
    }
  }

  // End check current password
  if (doc.password) {
    const trimmedpassword = doc.password.trim();
    if (trimmedpassword.length < 6) {
      return Promise.reject({
        error: "invalid password this should be greater than 5 character",
        status: 404
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(trimmedpassword, salt);
    if (bcrypt.compareSync(trimmedpassword, hash)) {
      doc.password = hash;
    }
  }
  return User.findByIdAndUpdate(
    decoded._id,
    {
      $set: {
        password: doc.password
      }
    },
    {
      $new: true
    }
  );
};

UserSchema.statics.findByCredentials = function(email, password) {
  const user = this;

  return user
    .findOne({
      email
    })
    .then(user => {
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
};

// encrypting our password with bcrypt.js
UserSchema.pre("save", function(next) {
  const user = this;
  // Let's check if the password was modified
  // we'll use a built in method for this

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      // Hashing password
      bcrypt.hash(user.password, salt, (err, hash) => {
        // if the user password is the same as hash then
        // password will have a new value which is the encrypted
        if (bcrypt.compare(user.password, hash)) {
          user.password = hash;
          next();
        }
      });
    });
  } else {
    // if nothing was modified then go next
    next();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
