'user strict';

const authController = require('./../controllers/authController');
const auth = require('./../middlewares/auth');
const mainRoute = '/api/advisor';

module.exports = app => {
  app.post(`${mainRoute}`, authController.postUser);
  app.post(`${mainRoute}/login`, authController.loginUser);
  app.get(`${mainRoute}/me`, auth, authController.getUser);
  app.delete(`${mainRoute}/logout`, auth, authController.logoutUser);
  app.put(`${mainRoute}/me`, auth, authController.modifyUser);
}