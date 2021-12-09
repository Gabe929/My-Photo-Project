var express = require('express');
var router = express.Router();
var db = require('../config/database');
const UserModel = require('../models/Users')
const { errorPrint, successPrint } = require ('../helpers/debug/debugprinters');
const  UserError  = require('../helpers/error/UserError');
var bcrypt = require('bcrypt');
const {registerValidator, loginValidator} = require('../middleware/validation');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/registration', registerValidator, (req, res, next) =>{
  // console.log(req.body);
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let cpassword = req.body.password;

  // res.json({
  //   message:"Valid user!!"
  // });

  UserModel.usernameExists(username)
  .then((usernameDoesExists) =>{
    if(usernameDoesExists){
      throw new UserError(
        "Registration failed: Username already exists",
        "/registration",
        200
      );
    } else{
      return UserModel.emailExists(email);
    }
  })
  .then((emailDoesExists) => {
    if(emailDoesExists){
      throw new UserError(
        "Registration failed: Email already exists",
        "/registration",
        200
      );
    } else{
      return UserModel.create(username, password, email);
    }
  })
  .then((createdUserId) => {
    if(createdUserId < 0){
      throw new UserError(
        "Server Error, user could not be created",
        "/registration",
        500
      );
    } else {
      successPrint("User.js --> User was created");
      req.flash('success', 'User account has been made!')
      res.redirect('/login');
    }
  })
  .catch((err)=>{
      errorPrint("User could not be made", err);
      if(err instanceof UserError){
        errorPrint(err.getMessage());
        req.flash('error', err.getMessage())
        res.status(err.getStatus());
        res.redirect(err.getRedirectURL());
      }
  });
});

router.post('/login', loginValidator, (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  UserModel.authenticate(username, password)
  .then((loggedUserId)=> {
    if (loggedUserId > 0) {
      successPrint(`User ${username} is logged in`);
      req.session.username = username;
      req.session.userId = loggedUserId;
      res.locals.logged = true;
      req.flash('success', 'You have been successfully logged in!')
      res.redirect('/');
    }else{
      throw new UserError("Invalid username and/or password", "/login", 200);
    }
  })
  .catch((err) => {
    errorPrint("user login failed");
    if(err instanceof UserError){
      errorPrint(err.getMessage());
      req.flash('error', err.getMessage())
      res.status(err.getStatus());
      res.redirect('/login')
    }else{
      next(err);
    }
  });
});

router.post("/logout",(req, res, next)=>{
  req.session.destroy((err)=>{
    if(err){
      errorPrint('session could not be destroyed');
      next(err)
    } else{
      successPrint('session was destroyed');
      res.clearCookie('csid');
      res.json({status:"OK", message:"user is logged out"});
    }
  });
});

module.exports = router;
