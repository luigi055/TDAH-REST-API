'user strict';

const authController = require('./../controllers/authController');
const auth = require('./../middlewares/auth');
const mainRoute = '/api/advisor';

module.exports = app => {
  app.post(`${mainRoute}`, authController.postUser);
  app.post(`${mainRoute}/login`, authController.loginUser);
  app.post(`${mainRoute}/change-password`, authController.changePasswordRequest);
  app.patch(`${mainRoute}/auth-change-password/:emailToken`, auth, authController.changePasswordAuth);
  app.patch(`${mainRoute}/change-password/:emailToken`, authController.changePassword);
  app.get(`${mainRoute}/me`, auth, authController.getUser);
  app.get(`${mainRoute}/activation`, auth, authController.resendConfirmation);
  app.get(`${mainRoute}/activation/:emailToken`, authController.confirmUser);
  app.get(`${mainRoute}/all`, auth, authController.getUsers);
  app.get(`${mainRoute}/change-password`, auth, authController.changePasswordAuthRequest);
  app.delete(`${mainRoute}/logout`, auth, authController.logoutUser);
  app.patch(`${mainRoute}/me`, auth, authController.modifyUser);
}