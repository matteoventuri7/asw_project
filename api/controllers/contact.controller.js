Contact = require("../models/contact.model");
User = require("../models/user.model");

notifyUser = (contact, eventName, authObject) => {
  User.findOne({'email':contact.email}, '_id', (err, user)=>{
    if (err) return handleError(err);
    if(user){
      console.log('emitting event...');
      global.io.emit(eventName+'_'+user._id, {user:{fullname:authObject.fullname}});         
    }
  });
};

exports.index = function (req, res) {
  Contact.find({userId : req.auth.sub}, function (err, contacts) {
    if (err) {
      res.json({
        status: "error",
        message: err
      });
    } else
      res.json({
        status: "success",
        message: "Contacts retrieved successfully",
        data: contacts
      });
  });
};

exports.getByFilter = function (req, res) {
  const filter = req.params.filter;
  const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
  const searchRgx = rgx(filter);
  
  Contact.find({userId : req.auth.sub, $or:[
      { firstName: { $regex: searchRgx, $options: "i" } },
      { lastName: { $regex: searchRgx, $options: "i" } },
      { email: { $regex: searchRgx, $options: "i" } },
      { city: { $regex: searchRgx, $options: "i" } }
  ]}, function (err, contacts) {
    if (err) {
      res.json({
        status: "error",
        message: err
      });
    } else
      res.json({
        status: "success",
        message: "Contacts retrieved successfully",
        data: contacts
      });
  });
};

exports.count = function (req, res) {
  Contact.count({userId : req.auth.sub}, function (err, countRes) {
    if (err) {
      res.json({
        status: "error",
        message: err
      });
    }
    res.json({
      status: "success",
      message: "Contacts retrieved successfully",
      data: countRes
    });
  });
};

exports.new = function (req, res) {
  Contact.find({ mobile: req.body.mobile.trim() }, function (err, contacts) {
    if (err) {
      res.json({
        status: "error",
        message: err
      });
    }
    if (contacts && contacts.length > 0) {
      res.status(400).send({
        status: "error",
        message: req.body.firstName + " is already exist"
      });
    } else {
      const userLoggedIn = req.auth.sub;
      var contact = new Contact();
      var contactObj = req.body;
      Object.keys(contactObj).forEach((key, index) => {
        contact[key] = contactObj[key];
      });
      contact.userId = userLoggedIn;
      // save the contact and check for errors
      contact.save(function (err) {
        if (err) {
          res.status(400).json({
            status: "error",
            error: err
          });
        }        
        
        notifyUser(contact, 'contact_create', req.auth);        

        res.json({
          message: "New contact created!",
          data: contact
        });
      });
    }
  });
};

exports.view = function (req, res) {
  Contact.findById(req.params.contact_id, function (err, contact) {
    if (err || contact.userId != req.auth.sub) {
      res.status(400).json({
        status: "error",
        error: err
      });
    }

    notifyUser(contact, 'contact_view', req.auth);

    res.json({
      message: "Contact details loading..",
      data: contact
    });
  });
};

exports.update = function (req, res) {
  Contact.findByIdAndUpdate(
    req.params.contact_id,
    req.body,
    { new: true },
    function (err, contact) {
      if (err || contact.userId != req.auth.sub) {
        res.status(400).json({
          status: "error",
          error: err
        });
      }

      // save the contact and check for errors
      contact.save(function (err) {
        if (err) res.json(err);
        res.json({
          message: "Contact Info updated",
          data: contact
        });
      });
    }
  );
};

exports.delete = function (req, res) {
  Contact.deleteOne(
    {
      _id: req.params.contact_id,
      userId: req.auth.sub
    },
    function (err, state) {
      if (err) {
        res.status(400).json({
          status: "error",
          error: err
        });
      }
      res.json({
        status: "success",
        message: "Contact deleted"
      });
    }
  );
};