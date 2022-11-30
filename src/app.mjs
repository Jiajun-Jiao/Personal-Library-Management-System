import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import './db.mjs';
import mongoose, { model } from 'mongoose';
import url from 'url';
import * as auth from './auth.mjs';

// passport.js

// import passport from 'passport';
// import LocalStrategy from 'passport-local';

// passport.use(new LocalStrategy(function verify(username, password, cb) {
//   db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, user) {
//     if (err) { return cb(err); }
//     if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }

//     crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//       if (err) { return cb(err); }
//       if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
//         return cb(null, false, { message: 'Incorrect username or password.' });
//       }
//       return cb(null, user);
//     });
//   });
// }));

// app.post('/login/password', passport.authenticate('local', {
//   successRedirect: '/',
//   failureRedirect: '/login'
// }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPath = path.resolve(__dirname, 'public');

// use function to create application object
const app = express();

// enable sessions
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
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

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

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
    res.render('index', {user: req.session.user, home: true, booklists: lists});
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
  if(req.body.choose === "yes"){
    sta = true;
  }
  else{
    sta = false;
  }

  if(req.session.user){
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
          res.redirect('/'); 
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
  BookList.findOne({name: req.params.slug}).populate('user').exec((err, booklist) => {
    if (err){
      console.log("error: SLUG ERROR");
      res.render('error', {message: "SLUG ERROR"});
    }else{
      res.render('book-detail-edit', {book: booklist.books.find(book => (book.title == req.params.slug2))});
    }
  });
});

app.post('/booklist/:slug/:slug2/detail/edit', (req, res) => {
  if(req.session.user){
    BookList.findOne({name: req.params.slug}).populate('user').exec((err, booklist) => {
      if (err){
        console.log("error: SLUG ERROR");
        res.render('error', {message: "SLUG ERROR"});
      }else{
        let sta = false;
        if(req.body.choose === "yes"){
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
  BookList.findOne({name: req.params.slug}).exec((err, booklist) => {
    if (err){
      console.log("error: SLUG ERROR");
      res.render('error', {message: "SLUG ERROR"});
    }else{
      res.render('booklist-edit', {booklist: booklist});
    }
  });
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
        booklist.books.forEach(b => {
          console.log(b.list+",");
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


// listen to a port
app.listen(process.env.PORT || 3000);