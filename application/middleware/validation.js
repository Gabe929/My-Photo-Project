const checkUsername = (username) =>{
    /**
     * Regex Explanation
     * ^ --> start of the sting
     * \D --> andthing NOT a digit
     * \w --> anything that is an alphanumeric character 
     * {2.} --> two or more characters with no upper limit
     */
    let usernameChecker = /^\D\w{2,}$/;
    return usernameChecker.test(username);
}

const checkPassword = (password) =>{
    if(password.length >= 8 ){
        let regexPassword = /[*+^$!@#/]/
        if (regexPassword.test(password)){
            let regex2Password = /[A-Z]/
            if (regex2Password.test(password)){
                let regex3Password = /[1-9]/
                if (regex3Password.test(password)){
                    return true
                }
            }
        }
    }
    return false  
}

const checkEmail = (email) =>{
    let emailChecker = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return emailChecker.test(email);
}

const registerValidator = (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    let cpassword = req.body.cpassword;
    let email = req.body.email;
    
    if(!checkUsername(username)){
        req.flash('error', "invalid username!!");
        req.session.save(err =>{
            res.redirect('/registration');
        })
    } else{
        if(!checkPassword(password)){
            req.flash('error', "invalid password!!");
            req.session.save(err =>{
                res.redirect('/registration');
            })
        } else{
            if(password != cpassword){
                req.flash('error', "password does not match!!");
                req.session.save(err =>{
                    res.redirect('/registration');
                })
            } else{
                if(!checkEmail(email)){
                    req.flash('error', "invalid email!!");
                    req.session.save(err =>{
                        res.redirect('/registration');
                    })
                } else{
                    next()
                }
            }      
        }      
    }         
}

const loginValidator = (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    
    if(!checkUsername(username)){
        req.flash('error', "invalid username!!");
        req.session.save(err =>{
            res.redirect('/registration');
        })
    } else{
        if(!checkPassword(password)){
            req.flash('error', "invalid password!!");
            req.session.save(err =>{
                res.redirect('/registration');
            })
        } else{    
            next();
        }
    }
}

module.exports = {registerValidator, loginValidator}