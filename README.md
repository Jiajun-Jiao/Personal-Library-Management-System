<!-- (__TODO__: your project name) -->

# Personal Library Management System

## Overview

<!-- (__TODO__: a brief one or two paragraph, high-level description of your project) -->

In the rapidly developed world these days, reading books provides people with a peaceful haven that protects us against the influence of such an impetuous and superficial society. Generally, the more one reads, the more one sees, experiences, and knows about themselves.

However, as time goes by, it's always difficult to remember exactly which books were read, what the books wrote about, and what the feeling was last time. Therefore, Personal Library Management System is available here to help!

Personal Library Management System is a web app that allows users to keep track of multiple book lists. Firstly, users can register and log in. Once they're logged in to the system, they can modify profiles, change account preferences, and create or view all their book lists. For every list of books that they have, they can edit the list description and add books to the list. For every book in any arbitrary list, they can edit its details or delete it.

## Data Model

<!-- (__TODO__: a description of your application's data and their relationships to each other)  -->

The application will store Users, Lists and Items

* users can have multiple lists (via references)
* each list can have multiple books (by embedding)

<!-- (__TODO__: sample documents) -->

An Example User:

```javascript
{
  username: "libraryhost",
  hash: // a password hash,
  lists: // an array of references to List documents
}
```

An Example List with Embedded Items:

```javascript
{
  user: // a reference to a User object
  name: "Literary Fiction",
  description: "Novels that are character-driven rather than plot-driven, examine the human condition, use language in an experimental or poetic fashion, or are simply considered \"serious\" art.",
  items: [
    { title: "The Great Gatsby",
      time: "20220913",
      rating: 4.3,
      contentOverview: "The novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan",
      comment: "a GREAT book!",
      status: 0},
    
    { title: "Animal Farm",
      time: "20221002",
      rating: 4.6,
      contentOverview: "the story of a group of farm animals who rebel against their human farmer, hoping to create a society where the animals can be equal, free, and happy. Ultimately, the rebellion is betrayed, and the farm ends up in a state as bad as it was before, under the dictatorship of a pig named Napoleon.",
      comment: "another GREAT book!",
      status: 2},
  ],
  createdAt: // timestamp
}
```

## [Link to Commented First Draft Schema](db.mjs) 

<!-- (__TODO__: create a first draft of your Schemas in db.mjs and link to it) -->

## Wireframes

<!-- (__TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc.) -->

/ - page for login or register

![list](documentation/login.jpg)

/list - page for showing all book lists

![list](documentation/list.jpg)

/list/create - page for creating a new book list

![list create](documentation/list-create.jpg)

/list/slug - page for showing specific book list

![list](documentation/list-slug.jpg)

/list/slug/description - page for editing description of a book list

![list](documentation/list-description.jpg)

/list/slug/bookname - page for showing specific book

![list](documentation/book.jpg)

## Site map

<!-- (__TODO__: draw out a site map that shows how pages are related to each other) 

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to. -->

![list](documentation/site-map.jpg)

## User Stories or Use Cases

<!-- (__TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://en.wikipedia.org/wiki/Use_case)) -->

![list](documentation/UseCaseDiagram.jpg)

## Research Topics

(__TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed)

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    * And account has been made for testing; I'll email you the password
    * see <code>cs.nyu.edu/~jversoza/ait-final/register</code> for register page
    * see <code>cs.nyu.edu/~jversoza/ait-final/login</code> for login page
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit)


## [Link to Initial Main Project File](app.mjs) 

(__TODO__: create a skeleton Express application with a package.json, app.mjs, views folder, etc. ... and link to your initial app.mjs)

## Annotations / References Used

(__TODO__: list any tutorials/references/etc. that you've based your code off of)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)

