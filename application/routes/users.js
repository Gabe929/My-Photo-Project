var express = require('express');
var router = express.Router();
var db = require('../config/database');
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

  db.execute("SELECT * FROM users WHERE usersname=?",[username])
  .then(([results,fields]) => {
    if(results && results.length == 0){
      return db.execute("SELECT * FROM users WHERE email=?",[email])
    }else{
      throw new UserError(
        "Registration failed: Username already exists",
        "/registration",
        200
      );
    }
  })
  .then(([results, fields])=>{ 
    if(results && results.length == 0){
      return bcrypt.hash(password, 12);
    }else{
      throw new UserError(
        "Registration failed: Email already exists",
        "/registration",
        200
      );
    }
  })
  .then((hashPassword)=>{ 
    let baseSQL = "INSERT INTO users (usersname, email, password, created) VALUES (?,?,?,now());"
    return db.execute(baseSQL,[username, email, hashPassword])
  })
  .then(([results, fields]) =>{
    if(results && results.affectedRows){
      successPrint("User.js --> User was created");
      req.flash('success', 'User account has been made!')
      res.redirect('/login');
    }else{
      throw new UserError(
        "Server Error, user could not be created",
        "/registration",
        500
      );
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

  // res.json({
  //   message:"Valid user!!"
  // });

  let baseSQL = "SELECT id, usersname, password FROM users WHERE usersname=?;"
  let userId;
  db.execute(baseSQL, [username])
  .then(([results,fields]) => {
    if(results && results.length == 1){
      let hashPassword = results[0].password;
      userId = results[0].id;
      return bcrypt.compare(password, hashPassword);
    }else{
      throw new UserError("invalid username and/or password", "/login", 200);
    }
  })
  .then((passwordsMatched)=>{
    if (passwordsMatched){
      successPrint(`User ${username} is logged in`);
      req.session.username = username;
      req.session.userId = userId;
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
  })
})

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
