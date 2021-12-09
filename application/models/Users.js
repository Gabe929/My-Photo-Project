var db = require('../config/database');
var bcrypt = require('bcrypt');
const UserModel = {};

UserModel.create = (username, password, email) => {
    return bcrypt.hash(password, 12)
    .then((hashPassword) =>{
        let baseSQL = "INSERT INTO users (usersname, email, password, created) VALUES (?,?,?,now());"
    return db.execute(baseSQL,[username, email, hashPassword])
    })
    .then(([results, fields]) =>{
        if(results && results.affectedRows){
            return Promise.resolve(results.insertId);
        } else {
            return Promise.resolve(-1);
        }
    })
    .catch((err) => Promise.reject(err));
}

UserModel.usernameExists = (username) => {
    return db.execute("SELECT * FROM users WHERE usersname=?",[username])
    .then(([results,fields]) => {
        return Promise.resolve(!(results && results.length == 0));
    })
    .catch((err) => Promise.reject(err));
}

UserModel.emailExists = (email)=> {
    return db.execute("SELECT * FROM users WHERE email=?",[email])
    .then(([results,fields]) => {
        return Promise.resolve(!(results && results.length == 0));
    })
    .catch((err) => Promise.reject(err));
}

UserModel.authenticate = (username, password)=> {
    let baseSQL = "SELECT id, usersname, password FROM users WHERE usersname=?;"
    let userId;
    return db
    .execute(baseSQL, [username])
    .then(([results, fields]) =>{
        if(results && results.length ==1){
            userId = results[0].id;
            return bcrypt.compare(password, results[0].password);
        } else{
            return Promise.reject(-1);
        }
    })
    .then((passwordsMatch) =>{
        if(passwordsMatch){
            return Promise.resolve(userId);
        } else {
            return Promise.resolve(-1);
        }
    })
    .catch((err) => Promise.reject(err));
};

module.exports = UserModel;