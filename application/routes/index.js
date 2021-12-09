var express = require('express');
var router = express.Router();
var isLoggedIn = require('../middleware/routeprotectors').userIsLoggedIn;
const {getRecentPosts, getPostById, getCommentByPostId} = require('../middleware/postsmiddleware');
var db = require("../config/database")
/* GET home page. */
router.get('/', getRecentPosts, function(req, res, next) {
  res.render('index');
});
router.get('/login', (req, res, next) =>{
  res.render('login');
})
router.get('/registration', (req, res, next) =>{
  res.render('registration');
})
router.use('/postImage', isLoggedIn);
router.get('/postImage', (req, res, next) =>{
  res.render('postImage');
})

router.get('/post/:id(\\d+)', getPostById, getCommentByPostId, (req, res, next)=>{
  res.render('viewpost', {title: `Post ${req.params.id}`});
});
// router.get('/post/help', (req, res, next)=>{
//   res.send({literal: "literal help"})
// })

module.exports = router;
