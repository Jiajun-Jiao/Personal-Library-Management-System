import * as dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import './db.mjs';
import mongoose from 'mongoose';
import * as auth from './auth.mjs';
import bcrypt from 'bcryptjs';

dotenv.config()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPath = path.resolve(__dirname, 'public');

// use function to create application object
const app = express();

// enable sessions
const sessionOptions = {
    secret: process.env.secret,
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(staticPath));

const User = mongoose.model('User');
const Book = mongoose.model('Book');
const BookList = mongoose.model('BookList');

const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

///////////////////////
// CUSTOM MIDDLEWARE //
///////////////////////

// require authenticated user for /booklist/add path
app.use(auth.authRequired(['/booklist/add']));

// make {{user}} variable available for all paths
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// logging
app.use((req, res, next) => {
  console.log(req.method, req.path, req.body);
  next();
});

////////////////////
// ROUTE HANDLERS //
////////////////////
app.get('/', (req, res) => {
  BookList.find({}).sort('-createdAt').exec((err, lists) => {
    let sta = false;
    if(lists.length === 0){
      sta = true;
    }
    else{
      sta = false;
    }
    res.render('index', {user: req.session.user, home: true, booklists: lists, status: sta});
  });
});

app.get('/logout', (req, res) => {
  auth.endAuthenticatedSession(req, err => {
    if (!err) {
        res.redirect('/');
    } else {
        res.render('error', {message: 'err authing???'}); 
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  // setup callbacks for register success and error
  function success(newUser) {
    auth.startAuthenticatedSession(req, newUser, (err) => {
        if (!err) {
            res.redirect('/');
        } else {
            res.render('error', {message: 'err authing???'}); 
        }
    });
  }

  function error(err) {
    res.render('register', {message: registrationMessages[err.message] ?? 'Registration error'}); 
  }

  // attempt to register new user
  auth.register(req.body.username, req.body.email, req.body.password, error, success);
});
        

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
  // setup callbacks for login success and error
  function success(user) {
    auth.startAuthenticatedSession(req, user, (err) => {
      if(!err) {
        res.redirect('/'); 
      } else {
        res.render('error', {message: 'error starting auth sess: ' + err}); 
      }
    }); 
  }

  function error(err) {
    res.render('login', {message: loginMessages[err.message] || 'Login unsuccessful'}); 
  }

  // attempt to login
  auth.login(req.body.username, req.body.password, error, success);
});


app.get('/booklist/add', (req, res) => {
  if(req.session.user){
    res.render('booklist-add');
  }
  else{
    res.redirect('/login');
  }
});

app.post('/booklist/add', (req, res) => {
  // TODO: complete POST /booklist/add
  if(req.session.user){
    const d = new Date();
    let date = d.getDate();
    let month = d.getMonth() + 1;
    const year = d.getFullYear();
    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }
    const bookList = new BookList({
      name: req.body.name,
      description: req.body.description,
      user: req.session.user._id,
      createdAt: `${month}/${date}/${year}`
    });
    bookList.save(function(err){
      if(!err){
        res.redirect('/'); 
      }
      else{
        console.log("error: SAVE ERROR");
        res.render('booklist-add',{message: 'SAVE ERROR'});
      }
    });
  }
  else{
    res.redirect('/login');
  }
});

app.get('/booklist/:slug', (req, res) => {
  BookList.findOne({slug: req.params.slug}).populate('user').exec((err, bookList) => {
    if (err){
      console.log("error: SLUG ERROR");
      res.render('error', {message: "SLUG ERROR"});
    }else{
      res.render('booklist', {bookList: bookList});
    }
  });
});

app.get('/booklist/:slug/addbook', (req, res) => {
  if(req.session.user){
    BookList.findOne({slug: req.params.slug}).populate('user').exec((err, bookList) => {
      if (err){
        console.log("error: SLUG ERROR");
        res.render('error', {message: "SLUG ERROR"});
      }else{
        res.render('book-add', {bookList: bookList});
      }
    });
  }
  else{
    res.redirect('/login');
  }
});

app.post('/booklist/:slug/addbook', (req, res) => {
  // TODO: complete POST /booklist/add
  let sta = false;
  if(req.body.check === "on"){
    sta = true;
  }
  else{
    sta = false;
  }

  if(req.session.user){
    console.log("check = " + req.body.check);
    const book = new Book({
      title: req.body.title,
      time: req.body.time,
      rating: req.body.number,
      contentOverview: req.body.contentOverview,
      comment: req.body.comment,
      status: sta,
      list: req.params.slug
    });
    BookList.findOne({slug: req.params.slug}).populate('user').exec((err, bookList) => {
      bookList.books.push(book);
      bookList.save(function(err){
        if(!err){
          res.redirect('/booklist/' + req.params.slug); 
        }
        else{
          console.log("error: SAVE ERROR");
          res.render('booklist-add',{message: 'SAVE ERROR'});
        }
      });
    });
  }
  else{
    res.redirect('/login');
  }
});

app.get('/booklist/:slug/:slug2/detail', (req, res) => {
  BookList.findOne({name: req.params.slug}).populate('user').exec((err, booklist) => {
    if (err){
      console.log("error: SLUG ERROR");
      res.render('error', {message: "SLUG ERROR"});
    }else{
      res.render('book-detail', {book: booklist.books.find(book => (book.title == req.params.slug2))});
    }
  });
});

app.get('/booklist/:slug/:slug2/detail/edit', (req, res) => {
  if(req.session.user){
    BookList.findOne({name: req.params.slug}).populate('user').exec((err, booklist) => {
      if (err){
        console.log("error: SLUG ERROR");
        res.render('error', {message: "SLUG ERROR"});
      }else{
        res.render('book-detail-edit', {book: booklist.books.find(book => (book.title == req.params.slug2))});
      }
    });
  }
  else{
    res.redirect('/login');
  }
});

app.post('/booklist/:slug/:slug2/detail/edit', (req, res) => {
  if(req.session.user){
    BookList.findOne({name: req.params.slug}).populate('user').exec((err, booklist) => {
      if (err){
        console.log("error: SLUG ERROR");
        res.render('error', {message: "SLUG ERROR"});
      }else{
        let sta = false;
        if(req.body.check === "on"){
          sta = true;
        }
        else{
          sta = false;
        }
        const book = booklist.books.find(book => (book.title == req.params.slug2));
        const index = booklist.books.indexOf(book);
        book.title = req.body.title,
        book.time = req.body.time,
        book.rating = req.body.number,
        book.contentOverview = req.body.contentOverview,
        book.comment = req.body.comment,
        book.status = sta,
        book.list = req.params.slug
        booklist.books[index] = book;
        booklist.save(function (err) {
          if (err)
          {
            console.log("error: UPDATE ERROR");
            res.render('error', {message: "UPDATE ERROR"});
          }
        });
        res.render('book-detail', {book: book});
      }
    });
  }
  else{
    res.redirect('/login');
  }
});

app.get('/booklist/:slug/edit', (req, res) => {
  if(req.session.user){
    BookList.findOne({name: req.params.slug}).exec((err, booklist) => {
      if (err){
        console.log("error: SLUG ERROR");
        res.render('error', {message: "SLUG ERROR"});
      }else{
        res.render('booklist-edit', {booklist: booklist});
      }
    });
  }
  else{
    res.redirect('/login');
  }
  
});

app.post('/booklist/:slug/edit', (req, res) => {
  if(req.session.user){
    BookList.findOne({name: req.params.slug}).exec((err, booklist) => {
      if (err){
        console.log("error: SLUG ERROR");
        res.render('error', {message: "SLUG ERROR"});
      }else{
        booklist.name = req.body.name,
        booklist.description = req.body.description;
        booklist.books.map(book => {
          const new_book = book;
          new_book.list = booklist.name;
          return new_book;
        });
        booklist.markModified("books");
        booklist.save(function (err) {
          if (err)
          {
            console.log("error: UPDATE ERROR");
            res.render('error', {message: "UPDATE ERROR"});
          }
          else{
            res.redirect('/booklist/' + booklist.name);
          }
        });
      }
    });
  }
  else{
    res.redirect('/login');
  }
});

app.get('/passwordReset', (req, res) => {
  if(req.session.user){
    res.render('password-reset');
  }
  else{
    res.redirect('/login');
  }
});

app.post('/passwordReset', (req, res) => {
  function success(user, newpswd) {
    bcrypt.hash(newpswd, 10, function(err3, hash) {
      if (err3){
        error("HASHING ERROR");
      }else{
        user.password = hash;
        user.save(function(err){
          if(err){
            error("USER SAVE ERROR");
          }
        });
        res.redirect("/");
      }
    });
  }

  function error(err) {
    console.log(err)
    res.render("password-reset", {message: err});
  }

  if (!req.session.user) {
    res.render("login", {message: "Login First to Reset Password"});
  }
  else{  
    // attempt to register new user
    auth.reset(req.session.user, req.body.oldpswd, req.body.newpswd1, req.body.newpswd2, error, success);
  }
});
// listen to a port
app.listen(process.env.PORT || process.env.localPORT);