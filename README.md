<!-- (__TODO__: your project name) -->

# Personal Library Management System

## Overview

<!-- (__TODO__: a brief one or two paragraph, high-level description of your project) -->

In the rapidly developed world these days, reading books provides people with a peaceful haven that protects us against the influence of such an impetuous and superficial society. Generally, the more one reads, the more one sees, experiences, and knows about themselves.

However, as time goes by, it's always difficult to remember exactly which books were read, what the books wrote about, and what the feeling was last time. Therefore, Personal Library Management System is available here to help!

Personal Library Management System is a web app that allows users to keep track of multiple book lists. Firstly, users can register and log in. Once they're logged in to the system, they can create or view all their book lists. For every list of books that they have, they can edit the list description and add books to the list. For every book in any arbitrary list, they can also edit its details.

## Data Model

The application will store Users, Books, and Lists.

* users can have multiple lists (via references)
* each list can have multiple books (by embedding array)

An Example User:

```javascript
{
  username: "libraryhost",
  hash: // a password hash,
}
```

An Example List with Embedded Books:

```javascript
{
  user: // a reference to a User object
  name: "Literary Fiction",
  description: "Novels that are character-driven rather than plot-driven, examine the human condition, use language in an experimental or poetic fashion, or are simply considered \"serious\" art.",
  items: [
    { title: "The Great Gatsby",
      time: "09/13/2022",
      rating: 4,
      contentOverview: "The novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan",
      comment: "a GREAT book!",
      status: true,
      list: "Literary Fiction"},
    
    { title: "Animal Farm",
      time: "10/02/2022",
      rating: 5,
      contentOverview: "the story of a group of farm animals who rebel against their human farmer, hoping to create a society where the animals can be equal, free, and happy. Ultimately, the rebellion is betrayed, and the farm ends up in a state as bad as it was before, under the dictatorship of a pig named Napoleon.",
      comment: "another GREAT book!",
      status: false,
      list: "Literary Fiction"},
  ],
  createdAt: // timestamp
}
```

## Wireframes

<!-- (__TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc.) -->


/ - home page, showing all book lists

![list](documentation/main.png)

/register - page for register

![list](documentation/register.png)

/login - page for login

![list](documentation/login.png)

/booklist/add - page for creating a new book list

![list create](documentation/list-add.png)

/booklist/slug - page for showing specific book list

![list](documentation/list-slug.png)

/booklist/slug/edit - page for editing the detail of a specific book list

![list](documentation/list-slug-edit.png)

/booklist/slug/addbook - page for adding a new book

![list](documentation/addbook.png)

/booklist/slug/slug2/detail - page for showing specific book

![list](documentation/book-detail.png)

/booklist/slug/slug2/detail/edit - page for editing the detail of a specific book

![list](documentation/book-edit.png)

/passwordReset - page for resetting the password

![list](documentation/reset.png)

/logout - page for processing logging out. If logout successfully, will redirect to main page

no image shown

## Site map

![list](documentation/site-map.jpg)

## Unit Testing Screenshot

![list](documentation/unit%20testing.png)

[Link to unit test code](test)