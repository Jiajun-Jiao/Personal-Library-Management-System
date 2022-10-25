import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
require('./db.mjs');

// use function to create application object
const app = express();

// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
      saveUninitialized: true
};
app.use(session(sessionOptions));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticPath = path.resolve(__dirname, 'public');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(staticPath));

app.get('/', (req, res) => {
    res.render('');
});

// listen to a port
app.listen(process.env.PORT || 3000);