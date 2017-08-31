'use strict';

function postUser(req, res) {
  const {
    email,
    password,
  } = req.body;
  res.send({
    email,
    password,
  });
}

module.exports = {
  postUser,
}