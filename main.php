<?php 

class Main {
  function showMain() {
  ?>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>NotesTracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
        <link rel="stylesheet" href="assets/stylesheets/screen.css">
      </head>
      <body>
        <header class="notes-tracker-header">
          <div class="frame">
            <h1>Notes tracker</h1>
            <button class="btn accept sign-out">Sign out</button>
          </div>
        </header>
        <section class="signup signin view">
          <div class="frame">
            <form class="credentials-form">
              <h2></h2>
              <div class="field-wrapper">
                <input type="email" class="form-control user" placeholder="user@email.dk" required>
                <span class="err"></span>
              </div>
              <div class="field-wrapper">
                <input type="password" class="form-control password" placeholder="password" required>
                <span class="err"></span>
              </div>
              <div class="formState"></div>
              <button class="btn form-submit"></button>
              <a class="signup-link">Don't have an account? Sign up to our Notes-tracker here!</a>
              <a class="signin-link">Already have an account? Sign in here!</a>
            </form>
          </div>
        </section>
        <section class="list view">
          <div class="frame">
            <h2>Your notes</h2>
            <ul class="notes-list"></ul>
            <button class="btn accept new-note">New note</button>
          </div>
        </section>
        <section class="form-note view">
          <div class="frame">
            <div class="notes-warning-state"></div>
            <form class="edit-note">
              <h2>New note</h2>
              <div class="field-wrapper">
                <input type="text" class="form-control note-title" placeholder="Your note title" required>
                <span class="err"></span>
              </div>
              <div class="field-wrapper">
                <textarea class="form-control note-body" placeholder="Your note content" required></textarea>
                <span class="err"></span>
              </div>
              <button class="btn form-submit">Save</button>
            </form>
          </div>
        </section>
        <script type="text/javascript" src="js/jquery-3.2.1.min.js"></script>
        <script type="text/javascript" src="js/index.js">
        </script>
      </body>
    </html>
  <?php 
  }
}
?>