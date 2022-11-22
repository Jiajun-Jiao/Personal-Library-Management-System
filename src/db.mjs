// 1ST DRAFT DATA MODEL
import mongoose from 'mongoose';
import Schema from 'mongoose';
import mongooseSlugPlugin from 'mongoose-slug-plugin';
import fs from 'fs';
import path from 'path';
import url from 'url';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://127.0.0.1/jj3100finalproject';
}
// 
mongoose.connect(dbconf);

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more lists
const UserSchema = new mongoose.Schema({
  // username provided by authentication plugin
  // password hash provided by authentication plugin
  username: {type: String, required: true},
  password: {type: String, unique: true, required: true}
});

// a book in a book list
// * includes the detail of this Book
const BookSchema = new mongoose.Schema({
  title: {type: String, required: true},
  time: {type: String, required: true},
  rating: {type: Number, default: 0, min: 0, max: 5, required: true},
  contentOverview: {type: String, default: "", required: false},
  comment: {type: String, default: "", required: false},
  status: {type: String, default: "", required: true},
  list: {type: String, required: true}
}, {
  _id: true
});

// a book list
// * each list must have a related user
// * each list must have a description
// * a list can have 0 or more items
const ListSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  description: {type: String, default: "", required: false},
  createdAt: {type: String, required: true},
  books: {type: Array, default: []}
  // [{type: Schema.Types.ObjectId, ref: 'Book'}]
});

// TODO: add remainder of setup for slugs, connection, registering models, etc. below
// ArticleSchema.plugin(mongooseSlugPlugin, {tmpl: '<%=title%>'});
ListSchema.plugin(mongooseSlugPlugin, {tmpl: '<%=name%>'});


//register models
mongoose.model('User', UserSchema);
mongoose.model('Book', BookSchema);
mongoose.model('BookList', ListSchema);

