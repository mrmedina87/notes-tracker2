# notes-tracker

## Instructions

1) Run index.html
2) Sign up to create a new user
3) It will automatically sign in with your new created user.
4) create new notes, you can CRUD them.
5) You can sign out and login again, or you create new users (those users will have their own set of notes, so you can CRUD for them too)

## Warning

- This is just frontend: data is not persisted and all the notes and users will be losted once you refreshed your browser window
- In order to edit styles, you will have to:

1) Install compass 
2) Using your console, go to the folder notes-tracker/
3) Run
 compass watch assets
4) Edit scss files

## Notes about the project

This project was developed to show my skillset.

It was developed using HTML5, Compass and jQuery.
Although I could had perfectly persisted a user's sesion using localStorage in the browser, I didn't continue with that approach because my project is totally mocked using just javascript arrays and I think it is clearer in that way for the person that will do the code review.

That said, the solution consists on a Module Pattern object where we make public just one method: start. When start runs the application is executed.

The init method is called the first time by start, and will be called every time the app changes between the different views, and is in charge of hiding and showing different parts of the DOM depending on the view.

The rest of the solution is based on the CRUD of two arrays (users and notes) using different forms for each case and validating them.