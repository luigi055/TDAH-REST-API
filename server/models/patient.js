'use strict';

const {
  Schema,
  model
} = require('mongoose');
const validator = require('validator');

const patientSchema = Schema({
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
        return age <= 10;
      }
    },
    message: 'El usuario no dispone de una edad correcta para esta aplicacion',
    required: [true, 'es necesario incorporar la edad del paciente'],
    _creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }
  }
});

const Patient = model('Patient', patientSchema);

module.exports = Patient;