'use strict';

const mongoose = require('mongoose');
const validator = require('validator');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  avance: Number,
  avatar: String,
  age: {
    type: Number,
    validate: {
      validator: function (age) {
        return age > 1;
      },
      message: 'El usuario no dispone de una edad correcta para esta aplicacion',
    },
    required: [true, 'es necesario incorporar la edad del paciente'],
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;