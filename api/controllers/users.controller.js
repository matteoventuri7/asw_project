User = require("../models/user.model");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const environment = require("../config/environment");

exports.index = function (req, res) {
  User.get(function (err, users) {
    if (err) {
      res.status(400).json({
        status: "error",
        error: "Bad Request."
      });
    }
    res.json({
      status: "success",
      message: "Users retrieved successfully",
      data: users
    });
  });
};

exports.new = function (req, res) {

  if(!req.body.username || !req.body.password){
    res.status(400).json({
      status: "error",
      message: "Missing request data"
    });
    return;
  }

  User.findOne({ username: req.body.username }, function (err, userFinded) {
    if (err) {
      res.status(400).json({
        status: "db error",
        message: err
      });
    } else if (userFinded) {
      res.status(400).send({
        status: "user exists error",
        message: req.body.username + " is already taken"
      });
    } else {
      var user = new User();
      user.username = req.body.username;
      user.email = req.body.username;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 10);
      }
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      // save the user and check for errors
      user.save(function (err) {
        if (err) {
          res.status(400).json({
            status: "save user error",
            error: err
          });
        }
        res.json({
          message: "New user created!",
          data: user
        });
      });
    }
  });
};

exports.view = function (req, res) {
  User.findById(req.params.user_id, function (err, user) {
    if (err) {
      res.status(400).json({
        status: "error",
        error: err
      });
    }
    res.json({
      message: "User details loading..",
      data: user
    });
  });
};

exports.update = function (req, res) {
  User.findByIdAndUpdate(req.params.user_id, req.body, { new: true }, function (
    err,
    user
  ) {
    if (err) {
      res.status(400).json({
        status: "error",
        error: err
      });
    }

    res.json({
      message: "User Info updated",
      data: user
    });
  });
};

exports.authenticate = function (req, res) {
  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) {
      res.status(400).json({
        status: "error",
        error: err
      });
    }

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      user.token = jwt.sign({ sub: user._id, fullname: `${user.firstName} ${user.lastName}` }, environment.secret, {
        algorithm: "HS256"
      });
      delete user.password;
      res.json({
        status: "success",
        message: "Users retrieved successfully",
        data: user
      });
    } else {
      res.status(401).send({
        status: "error",
        message: "User name or password is invalid."
      });
    }
  });
};

exports.changePassword = function (req, res) {
  if(!req.body.password){
    res.status(400).json({
      status: "error",
      message: "Missing request data"
    });
    return;
  }

  User.findById(req.params.user_id, function (err, user) {
    if (err) {
      res.status(400).json({
        status: "error",
        error: err
      });
    }

    user.password = bcrypt.hashSync(req.body.password, 10);
    
    user.save(function (err) {
      if (err) res.json(err);
      res.status(202).send({
        status: "success",
        message: "Password Updated successfully"
      });
    });
  });
};
