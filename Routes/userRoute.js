const express = require("express");
const userRouter = express.Router();

const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getUser, updateRole, deleteUser } = require("../Controllers/userController");
const { isAuthenticated, isAuthorized } = require('../middleware/auth');

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/password/forgot").post(forgotPassword);
userRouter.route("/password/reset/:token").put(resetPassword);
userRouter.route("/password/update").put(isAuthenticated, updatePassword);
userRouter.route("/me").get(isAuthenticated, getUserDetails);
userRouter.route("/me/update").put(isAuthenticated, updateProfile);
userRouter.route("/admin/users").get(isAuthenticated, isAuthorized("admin"), getAllUsers);
userRouter.route("/admin/user/:id").get(isAuthenticated, isAuthorized("admin"), getUser).put(isAuthenticated, isAuthorized("admin"), updateRole).delete(isAuthenticated, isAuthorized("admin"), deleteUser);
userRouter.route("/logout").get(logoutUser);


module.exports = userRouter;