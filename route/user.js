const express = require("express");
const router = express.Router();
const users = require("./../controller/userController");
const passport = require("passport");

router.route("/register").get(users.renderRegister).post(users.register);

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureMessage: true,
      keepSessionInfo: true,
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
