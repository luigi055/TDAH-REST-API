'use strict';

const patientController = require('./../controllers/patientController');
const auth = require('./../middlewares/auth');
const mainRoute = '/api/patients';

module.exports = app => {
  app.post(`${mainRoute}`, auth, patientController.addPatient);
  app.get(`${mainRoute}/:id`, auth, patientController.getPatient);
  app.get(`${mainRoute}/`, auth, patientController.getPatients);
  app.delete(`${mainRoute}/:id`, auth, patientController.deletePatient);
  app.patch(`${mainRoute}/:id`, auth, patientController.updatePatient);
}