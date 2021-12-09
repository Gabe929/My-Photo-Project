var express = require('express');
var router = express.Router();
var db = require('../config/database');
var PostModel = require("../models/Posts")
const { errorPrint, successPrint } = require ('../helpers/debug/debugprinters');
const sharp = require('sharp');
const multer  = require('multer');
var crypto = require('crypto');
var PostError = require ('../helpers/error/PostError');
const { postValidator } = require('../middleware/validation');
const {route} = require('.');

var storage = multer.diskStorage({
    destination: function(req, file, cb){ 
        cb(null, "public/uploads");
    },
    filename: function(req, file, cb){
        let fileExt = file.mimetype.split('/')[1];
        let randomName = crypto.randomBytes(22).toString("hex");
        cb(null, `${randomName}.${fileExt}`);
    }
});

 var uploader = multer({storage : storage}); 

router.post('/createPost', uploader.single("uploadImage"), postValidator, (req, res, next) =>{
    let fileUploaded = req.file.path;
    let fileAsThumbnail = `thumbnail-${req.file.filename}`;
    let destinationOfThumbnail = req.file.destination + "/" + fileAsThumbnail;
    let title = req.body.title;
    let description = req.body.description;
    let fk_userId = req.session.userId

    sharp(fileUploaded)
    .resize(200)
    .toFile(destinationOfThumbnail)
    .then(()=> {
        return PostModel.create(
            title, 
            description, 
            fileUploaded, 
            destinationOfThumbnail, 
            fk_userId
        );
    }) 
    .then((postWasCreated) =>{
        if(postWasCreated){
            req.flash('success', 'Your post was created successfully!');
            res.redirect('/');
        } else{
            throw new PostError('Post coud not be created!!', '/postImage', 200);
        }
    })
    .catch((err) =>{
        if(err instanceof PostError){
            errorPrint(err.getMessage());
            req.flash('error', err.getMessage());
            res.status(err.getStatus());
            res.redirect(err.getRedirectURL());
        }else{
            next(err);
        }
    })
});

router.get('/search', async (req, res, next)=> {
    try{
        let searchTerm = req.query.search;
        if(!searchTerm){
            res.send({
                message:"No search term given",
                results: []
            });      
        } else {
            let results = await PostModel.search
            (searchTerm);
            if(results.length){
                res.send({
                    message: `${results.length} Results found`,
                    results: results
                });
            } else{
                let results = await PostModel.getNRecentPosts(8);
                res.send({
                    message: "No results found (Here are the 8 most recent post)",
                    results: results
                });
            }
        }
    } catch(err){
        next(err);
    } 
});

module.exports = router;