# Notes Tracker2

## Description

Notes tracker 2 is a webapp based on plain php and jquery. It allows any user to create an account. Each account can CRUD notes (title + content).

## Setup Instructions

- This is NOT just frontend: you will have to install apache, PHP and MySql to run this. I strongly recommend you to use virtual hosts in Wamp or Mamp to achieve this. 

- Create a virtual host called notestracker2 using a port that does not generate conflict with any other app in your host. You can follow this tutorial in order to set them: https://docs.google.com/document/d/1Cv8Ew5C3P2PrIco4Tceba_zfSzcWlK5yRk5rpJtxoak/edit?usp=sharing

- So as to create the database and tables structure, run the following sql code in your phpmyadmin:

```
CREATE DATABASE IF NOT EXISTS `notestracker2` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `notestracker2`;

CREATE TABLE IF NOT EXISTS `notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
```

- Go to http://notestracker2:8080 (replace here 8080 with your chosen port) 
- Sign up to create a new user
- It will automatically sign in with your new created user.
- You can CRUD notes in this user now. Those notes will belong ONLY to this user.
- You can sign out and login again, or you create new users (those users will have their own set of notes, so you can CRUD more notes).

## Styles

In order to edit styles, you will have to:

1) Install compass 
2) Using your console, go to your vhost folder
3) Run this command line:
 compass watch assets
4) Edit scss files

## Notes about the project

This project was developed to show my skillset.

The front-end layer was developed using HTML5, Compass and jQuery. Previous version used two arrays to mockup the backend, but in this new version we do have a back-end so we use ajax to communicate against the REST API. The solution consists on a Module Pattern object where we make public just one method: start. When start runs the application is executed.
The init method is called the first time by start, and will be called every time the app changes between the different views (states), and this method is also in charge of hiding and showing different parts of the DOM depending on the view.

The back-end was implemented using plain PHP to build a RESTful interface that handle requests depending on their HTTP-verbs. It also uses a jwt algorithm to generate a token to handle authentication. 

I based my jwt solution on this implementation of the encrypt/decrypt generator: https://github.com/firebase/php-jwt

Authentication header is required when dealing with the RESTful resource "note".
Finally, interaction against database entity was implemented using mysqli and prepared statements to avoid sql injection.