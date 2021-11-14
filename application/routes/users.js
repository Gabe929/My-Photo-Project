var express = require('express');
var router = express.Router();
var db = require('../config/database');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/registration', (req, res, next) =>{
  // console.log(req.body);
  let username = req.body.usersname;
  let email = req.body.username;
  let password = req.body.password;
  let cpassword = req.body.password;

  // req.send('data');
  /**
   * Do server side validation
   */
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
      let baseSQL = "INSERT INTO users (usersname, email, password, created) VALUES (?,?,?,now());"
      return db.execute(baseSQL,[username, email, password])
    }else{
      throw new UserError(
        "Registration failed: Email already exists",
        "/registration",
        200
      );
    }
  })
  .then(([results, fields]) =>{
    if(results && results.affectedRows){
      successPrint("User.js --> User was creasted");
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
      res.status(err.getStatus());
      res.redirect(err.getRedirectURL());
    }
  });
})

module.exports = router;
