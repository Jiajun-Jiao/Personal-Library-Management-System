import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// assumes that User was registered in `./db.mjs`
const User = mongoose.model('User');

// Reference:
// https://www.npmjs.com/package/bcryptjs
const reset = (user, oldpswd, newpswd1, newpswd2, error, success) => {
  if(newpswd1 !== newpswd2){
    error("ENTERED DIFFERENT NEW PASSWORD");
  }
  else if((oldpswd.length < 8) || (newpswd1.length < 8)){
    error("PASSWORD TOO SHORT");
  }
  else{
    User.findOne({username: user.username}, function(err1, user){
      if (err1) {
          error("USERNAME FIND ERROR")
      }
       else {
        bcrypt.compare(oldpswd, user.password, (err2, passwordMatch) => {
          if(err2){
            error("PASSWORD FIND ERROR");
          }
          else if(!passwordMatch){
            error("PASSWORDS DO NOT MATCH");
          }
          else{
            success(user, newpswd1);
          }
        });
      }
    });
  }
}

const startAuthenticatedSession = (req, user, cb) => {
  req.session.regenerate(function(err){
    if (!err) {
      // set a property on req.session that represents the user
      req.session.user = user;
    } else {
      // log out error
      // call callback with error
      console.log("error: REGENERATE ERROR");
    }
    cb(err);
  });
};

const endAuthenticatedSession = (req, cb) => {
  req.session.destroy((err) => { cb(err); });
};


const register = (username, email, password, errorCallback, successCallback) => {
  // TODO: implement register
  if((username.length < 8) || (password.length < 8)){
    console.log("error: USERNAME PASSWORD TOO SHORT");
    errorCallback({message: "USERNAME PASSWORD TOO SHORT"});
  }
  else{
    const User = mongoose.model('User');
    User.findOne({username: username}, function(err, result){
      if(result){
        console.log("error: USERNAME ALREADY EXISTS");
        errorCallback({message: "USERNAME ALREADY EXISTS"});
      }
      else{
        bcrypt.hash(password, 10, function(err, hash){
          const u = new User({
            username: username,
            // email: email,
            password: hash,
          });
          u.save(function(err, savedUser){
            if(err){
              console.log("error: DOCUMENT SAVE ERROR");
              errorCallback({message: "DOCUMENT SAVE ERROR"});
            }
            else{
              successCallback(savedUser);
            }
          });
        });
      }
    });
  }
};

const login = (username, password, errorCallback, successCallback) => {
  User.findOne({username: username}, (err, user) => {
    if(err){
      console.log("error: USER-FIND ERROR");
      errorCallback({message: "USER-FIND ERROR"});
    }
    else if(!user){
      console.log("error: USER NOT FOUND");
      errorCallback({message: "USER NOT FOUND"});
    }
    else{
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        // regenerate session if passwordMatch is true
        if(passwordMatch){
          successCallback(user);
        }
        else{
          console.log("error: PASSWORDS DO NOT MATCH");
          errorCallback({message: "PASSWORDS DO NOT MATCH"});
        }
      });
    }
   });
};

// creates middleware that redirects to login if path is included in authRequiredPaths
const authRequired = authRequiredPaths => {
  return (req, res, next) => {
    if(authRequiredPaths.includes(req.path)) {
      if(!req.session.user) {
        res.redirect('/login'); 
      } else {
        next(); 
      }
    } else {
      next(); 
    }
  };
};

export {
  reset,
  startAuthenticatedSession,
  endAuthenticatedSession,
  register,
  login,
  authRequired
};
