// 1ST DRAFT DATA MODEL
import mongoose from 'mongoose';

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more lists
const User = new mongoose.Schema({
  // username provided by authentication plugin
  // password hash provided by authentication plugin
  lists:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }]
});

// a book in a book list
// * includes the detail of this item
const Item = new mongoose.Schema({
  title: {type: String, required: true},
  time: {type: String, required: true},
  rating: {type: Number, default: 0, min: 0, max: 5, required: true},
  contentOverview: {type: String, default: "", required: false},
  comment: {type: String, default: "", required: false},
  status: {type: Number, default: 0, min: -1, max: 2, required: true}
}, {
  _id: true
});

// a book list
// * each list must have a related user
// * each list must have a description
// * a list can have 0 or more items
const List = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  description: {type: String, default: "", required: false},
  createdAt: {type: Date, required: true},
  items: [Item]
});

// TODO: add remainder of setup for slugs, connection, registering models, etc. below

