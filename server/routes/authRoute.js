'user strict';

const authController = require('./../controllers/authController');
const mainRoute = '/api/advisor';

module.exports = app => {
  app.post(`${mainRoute}`, authController.postUser);
}