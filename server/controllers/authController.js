"use strict";

const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");
const mongoose = require("./../db/mongoose");
const User = require("./../models/user");
const Patient = require("./../models/patient");

const {
  successEmailPassword,
  emailConfirmation,
  emailChangePwAuth,
  emailChangePw
} = require("./../emails/sendMails");

function postUser(req, res) {
  var patient;
  patient = req.body.patients;
  const user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  user.displayName = req.body.displayName;
  user.avatar = req.body.avatar;
  user.workplace = req.body.workplace;
  user.location = req.body.location;
  //for (var i = 0; i < patient.length; i++) {
  user.patients = patient;
  // console.log(`aqui esta el numero ${[i]}, ${patient[i]}`);
  //}

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      emailConfirmation(user, req.headers.host);
      res.header("x-auth", token).send(user);
    })
    .catch(err => res.status(400).send(err));
}

function confirmUser(req, res) {
  const { emailToken } = req.params;

  User.findByEmailTokenAndConfirm(emailToken)
    .then(user => {
      if (!user) return res.status(404).send();
      res.send({
        message: "Email successfully confirmed"
      });
    })
    .catch(err =>
      res.status(400).send({
        error: "Email wasn't able to be confirmed"
      })
    );
}

function resendConfirmation(req, res) {
  if (req.user.confirmed) {
    return res.send({
      message: "Your account is already activated"
    });
  }
  emailConfirmation(req.user, req.headers.host);
  res.send({
    message: "Activation Email was sent"
  });
}

function getUser(req, res) {
  // comes from auth middleware
  res.send(req.user);
}

function getUsers(req, res) {
  User.find({}, (err, user) => {
    if (err) res.status(500).send({ message: `Error en la peticion ${err}` });
    if (!user)
      return res.status(404).send({ message: "los usarios no existen" });
    res.status(200).send({ user });
  })
    .populate({ path: "patients" })
    .exec((err, patient) => {
      console.log(patient[0]);
    });
}

function loginUser(req, res) {
  const { email, password } = req.body;

  User.findByCredentials(email, password)
    .then(user => {
      // if (!user.confirmed) return res.status(401).send({
      //   error: 'Please confirm your account before continue',
      // });

      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(err => {
      return res.status(404).send();
    });
}

function logoutUser(req, res) {
  // req.user and req.token were filled in auth.js middleware
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => res.status(400).send());
}

function modifyUser(req, res) {
  const { body, token, user: advisor } = req;

  User.findByIdAndChangeData(advisor._id, body, advisor.password)
    .then(user => {
      if (!user) return res.status(404).send();
      if (body.password) {
        // remove token after change password
        req.user
          .removeToken(token)
          .then(() => {
            res.send({
              message: "token removed"
            });
          })
          .catch(err => res.status(400).send());
      } else {
        res.send();
      }
    })
    .catch(err => res.status(err.status || 400).send(err));
}

function changePasswordAuthRequest(req, res) {
  const { user } = req;

  emailChangePwAuth(user, req.headers.host);

  res.send({
    message: "change password request was sent to your email, check your inbox"
  });
}

function changePasswordRequest(req, res) {
  const { email } = req.body;

  if (!email) {
    res.status(404).send({
      error: "Provide an email"
    });
  }

  User.findOne({
    email
  })
    .then(user => {
      if (!user)
        return res.status(404).send({
          error: "email not found"
        });
      emailChangePw(user, req.headers.host);
      res.send({
        message:
          "change password request was sent to your email, check your inbox"
      });
    })
    .catch(err => res.status(400).send());
}

function changePasswordAuth(req, res) {
  const { params: { emailToken }, token, user, body } = req;

  const newPw = body.password;
  // If exist user is because this user is already logged in
  // if this request is for authenticated user who wanted to have their password changed
  // so if user exist it must provide its current password
  if (!(user && body.currentPassword)) {
    res.status(401).send({
      error: "you must provide your current password"
    });
  }

  User.findByEmailTokenAndChangePassword(emailToken, body, user.password)
    .then(user => {
      if (!user) return res.status(404).send();
      if (body.password) {
        // remove token after change password
        req.user
          .removeToken(token)
          .then(() => {
            successEmailPassword(newPw, user.email);
            res.send({
              message: "password was changed and token was removed"
            });
          })
          .catch(err => res.status(400).send());
      } else {
        res.status(400).send();
      }
    })
    .catch(err => res.status(err.status || 400).send(err));
}

function changePassword(req, res) {
  const { params: { emailToken: token }, query: { email }, body } = req;

  if (!email || !isEmail(email)) {
    res.status(404).send({
      error: "invalid email"
    });
  }

  const newPw = body.password;

  User.findByEmailTokenAndChangePassword(token, body)
    .then(user => {
      if (!user) return res.status(404).send();
      successEmailPassword(newPw, email);
      res.send({
        message: "password was changed"
      });
    })
    .catch(err => res.status(err.status || 400).send(err));
}

module.exports = {
  postUser,
  confirmUser,
  resendConfirmation,
  getUser,
  getUsers,
  loginUser,
  logoutUser,
  modifyUser,
  changePasswordAuthRequest,
  changePasswordRequest,
  changePasswordAuth,
  changePassword
};
