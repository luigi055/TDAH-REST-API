"use strict";

const mongoose = require("./../db/mongoose");
const Patient = require("./../models/patient");
const User = require("./../models/user");
const { ObjectID } = require("mongodb");

function addPatient(req, res) {
  const { body } = req;
  body._creator = req.user._id;
  const patient = new Patient(body);

  patient
    .save()
    .then(patient => {
      res.send(user);
      User.update(
        {
          _id: req.user._id
        },
        {
          $addToSet: {
            patients: patient._id
          }
        }
      )
        .then(user => {
          if (!user) {
            console.log(`usuario no encontrado ${user}`);
          } else {
            console.log(`paciente agregado`);
          }
        })
        .catch(err => {
          console.log(`valor no encontrado ${err}`);
        });
    })
    .catch(err => res.status(400).send(err));
}

function getPatient(req, res) {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: "Invalid ID"
    });
  }
  Patient.findOne({
    _id: id,
    _creator: req.user._id
  })
    .then(patient => {
      if (!patient) {
        return res.status(404).send({
          error: "patient not found"
        });
      }
      res.send(patient);
    })
    .catch(err =>
      res.status(400).send({
        error: "incorrect id format"
      })
    );
}

function getPatients(req, res) {
  const { _id } = req.user;

  Patient.find({
    _creator: _id
  })
    .then(patients => {
      res.send(patients);
    })
    .catch(err => res.status(400).send());
}

function deletePatient(req, res) {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: "Invalid ID"
    });
  }

  Patient.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
    .then(patient => {
      if (!patient) {
        return res.status(404).send({
          error: "patient not found"
        });
      } else {
        User.update(
          {
            _id: req.user._id
          },
          {
            $pull: {
              patients: patient._id
            }
          }
        )
          .then(user => {
            if (!user) {
              console.log(`paciente no encontrado en usuario`);
            } else {
              console.log(`paciente eliminado`);
            }
          })
          .catch(err => {
            console.log(`valor no encontrado ${err}`);
          });
      }
      res.send(patient);
    })
    .catch(err =>
      res.status(400).send({
        error: "incorrect id format"
      })
    );
}

function updatePatient(req, res) {
  const { id } = req.params;
  const { body } = req;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({
      error: "Invalid ID"
    });
  }

  Patient.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    {
      $set: body
    },
    {
      $new: true
    }
  )
    .then(patient => {
      if (!patient) {
        return res.status(404).send({
          error: "patient not found"
        });
      }

      res.send(patient);
    })
    .catch(err =>
      res.status(400).send({
        error: "incorrect id format"
      })
    );
}

module.exports = {
  addPatient,
  getPatient,
  getPatients,
  deletePatient,
  updatePatient
};
