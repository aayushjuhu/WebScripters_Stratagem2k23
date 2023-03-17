const { urlencoded } = require("express");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const app = express();
const Order = require("./../models/Order");
const User = require("./../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, username, password, comp_type } = req.body;
    console.log(comp_type);
    const user = new User({ email, username, comp_type });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.redirect("/dashboard");
    });
  } catch (e) {
    req.flash("error", `${e.message}`);
    console.log(e);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  try {
    console.log("Hello Inside Login controller");
    console.log(req.user);
    res.redirect("/dashboard");
  } catch (e) {
    console.log(e);
  }
};

module.exports.logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    console.log("Logging Out");
    req.flash("success", "Goodbye!");
    res.redirect("/");
  });
};

module.exports.dashboard = async (req, res) => {
  const user = req.user;
  const users1 = await User.findById(req.user._id).populate("coupon");
  var total_coupons = 0;
  users1.coupon.forEach((e) => {
    console.log(total_coupons);
    total_coupons += e.numCodes;
  });
  var bill = total_coupons * 3;
  users1.balance_bill = bill;
  var user_k = new User(users1);
  await user_k.save();
  const users = await User.findById(req.user._id).populate("coupon");
  res.render("coupon/dashboard", { users, total_coupons });
};
