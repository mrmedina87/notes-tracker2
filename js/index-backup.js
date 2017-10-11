$(function() {
  var feature = (function() {
    var currentUser = {
      name: null,
      password: null,
      id: null
    };

    var users = [];
    var notes = [];

    var stateApp = "signup";

    var formCredentials = $(".credentials-form");
    var formCredentialsTitle = formCredentials.find("h2");
    var formCredentialsSubmit = formCredentials.find(".form-submit");
    var formCredentialsUser = formCredentials.find(".user");
    var formCredentialsPassword = formCredentials.find(".password");
    var formCredentialsValid = false;
    
    var headerWrapper = $("header.notes-tracker-header > div.frame");
    var signOutButton = $(".sign-out");
    var signupLink = $(".signup-link");
    var newNote = $(".new-note");

    var formNote = $(".edit-note");
    var formNoteh2 = $(".edit-note").find("h2");
    var formNoteSubmit = formNote.find(".form-submit");
    var formNoteTitle = formNote.find(".note-title");
    var formNoteBody = formNote.find(".note-body");

    var formNoteValid = true;

    var notesList = $("section.list ul.notes-list");

    var init = function(state) {
      stateApp = state || stateApp;
      var delay = 0;
      clearCredsForm();
      formCredentials.removeClass("show-signup-link");

      if(currentUser.name && currentUser.password) {
        stateApp = stateApp || "list";
        formCredentialsTitle.text("Sign in to Notes-tracker");
        formCredentialsSubmit.text("Sign in");
      }
      else {
        if(users.length === 0 || stateApp === "signup") {
          formCredentialsTitle.html("Registration form"); 
          formCredentialsSubmit.html("Sign up");
        }
        else {
          stateApp = "signin";
          formCredentialsTitle.text("Sign in to Notes-tracker");
          formCredentialsSubmit.text("Sign in");
          formCredentials.addClass("show-signup-link");
        }
      }

      headerWrapper.removeClass("show-signout-button");
      if(stateApp === "list" || stateApp === "form-note") {
        headerWrapper.addClass("show-signout-button");
        delay = 0;

        if(stateApp === "list") {
          populateList();
        }
      }

      $("section.view").hide(delay);
      $("section." + stateApp).show(delay);
    }

    var populateList = function() {
      notesList.empty();
      var listItem = $("<li></li>");
      var listItemTitle = $("<h3 class='note-title'></h3>");
      var listItemBody = $("<p class='note-body'></p>");
      var listItemEditButton = $("<button class='btn cancel'>edit</button>");
      var listItemDeleteButton = $("<button class='btn accept'>delete</button>");

      var newlistItem;
      var newlistItemTitle;
      var newlistItemBody;
      var newlistItemEditButton;
      var newlistItemDeleteButton;
      var atLeastOne = false;

      for (var i = notes.length - 1; i >= 0; i--) {
        if(notes[i].userId === currentUser.id) {
          atLeastOne = true;
          newlistItem = listItem.clone();
          newlistItemTitle = listItemTitle.clone().text(notes[i].title);
          newlistItemBody = listItemBody.clone().text(notes[i].body);
          newlistItemEditButton = listItemEditButton.clone();
          newlistItemDeleteButton = listItemDeleteButton.clone();
          
          newlistItemEditButton.click(goToNoteForm.bind({
            isNew: false,
            noteId: notes[i].id,
            noteTitle: notes[i].title,
            noteBody: notes[i].body
          }));
          newlistItemDeleteButton.click(deleteNote.bind({noteId: notes[i].id}));

          newlistItem
            .append(newlistItemTitle)
            .append(newlistItemBody)
            .append(newlistItemEditButton)
            .append(newlistItemDeleteButton);
          
          notesList.append(newlistItem);
        }
      }

      if(!atLeastOne) {
        newlistItem = listItem.clone();
        newlistItem.append($("<span class='no-items-message'></span>").text("Looks like you didn't add notes yet, try adding new items by clicking in the New note button below :)"))
        newlistItem.appendTo(notesList);
      }
    }
    
    var deleteNote = function(e) {
      e.preventDefault();
      var idx = -1;
      for (var i = notes.length - 1; i >= 0; i--) {
        if(notes[i].id === this.noteId) {
          idx = i;
        }
      }
      if(idx >= 0) {
        notes.splice(idx, 1);
      }
      init("list");
    }

    var goToNoteForm = function() {
      clearNoteForm();
      if(this.isNew === true) {
        formNoteh2.text("New note");
        formNote.attr("note-id", "");
      }
      else {
        formNoteh2.text("Edit note");
        formNote.attr("note-id", this.noteId);
        formNoteTitle.val(this.noteTitle);
        formNoteBody.val(this.noteBody);
      }
      init("form-note");
    }

    var clearCredsForm = function () {
      formCredentialsUser.val("");
      formCredentialsUser.next().text("");
      formCredentialsPassword.val("");
      formCredentialsPassword.next().text("");
    }

    var clearNoteForm = function () {
      formNoteTitle.val("");
      formNoteTitle.next().text("");
      formNoteBody.val("");
      formNoteBody.next().text("");
    }

    var start = function() {
      init();
      formCredentialsSubmit.click(validateCredsAndSend);
      signOutButton.click(logOut);
      signupLink.click(goToSignUp);

      newNote.click(goToNoteForm.bind({isNew: true}));
      formNoteSubmit.click(validateNoteAndSave);
    }

    var logOut =function() {
      currentUser.name = null;
      currentUser.password = null;
      init();
    }

    var goToSignUp = function() {
      init("signup");
    }

    var userExists = function(userName) {
      exists = false;
      for (var i = users.length - 1; i >= 0; i--) {
        if(users[i].name === userName) {
          exists = true;
        }
      }
      return exists;
    }

    var saveAndLogin = function() {
      var usr = {};
      usr.name = formCredentialsUser.val();
      usr.password = formCredentialsPassword.val();
      usr.id = users.length + 1;
      users.push(usr);
      login();
    }

    var login = function() {
      var userName = formCredentialsUser.val();
      var password = formCredentialsPassword.val();
      var success = false;
      for (var i = users.length - 1; i >= 0; i--) {
        if (users[i].name === userName && users[i].password === password) {
          success = true;
          currentUser.name = userName;
          currentUser.password = password;
          currentUser.id = users[i].id;
        }
      }
      if (success) {
        init("list");
      }
      else {
        formCredentialsUser.next().text("Bad credentials, please try again.");
      }
    }

    var validateCredsAndSend = function(e) {
      e.preventDefault();
      formCredentialsValid = true;
      if (formCredentialsUser.is(":invalid")) {
        formCredentialsValid = false;
        formCredentialsUser.next().text("User field is required and should be filled with email format");
      }
      else {
        if( stateApp === "signup" && userExists(formCredentialsUser.val()) ) {
          formCredentialsValid = false;
          formCredentialsUser.next().text("That user-name was already registered. Please, insert a new one.");
        }
        else {
          formCredentialsUser.next().text("");
        }
      }
      
      if (formCredentialsPassword.is(":invalid")
        || formCredentialsPassword.val().length <= 8) {
        formCredentialsValid = false;
        formCredentialsPassword.next().text("Password field is required and should be longer than 8 characters");
      }
      else {
        formCredentialsPassword.next().text("");
      }
      if(formCredentialsValid) {
        if(stateApp === "signup") {
          saveAndLogin();
        }
        else {
          login();
        }
      }
    };

    var validateNoteAndSave = function(e) {
      var noteId = formNote.attr("note-id");
      e.preventDefault();
      formNoteValid = true;
      if (formNoteTitle.is(":invalid")) {
        formNoteValid = false;
        formNoteTitle.next().text("Title is required");
      }
      else {
        formNoteTitle.next().text("");
      }
      
      if (formNoteBody.is(":invalid")) {
        formNoteValid = false;
        formNoteBody.next().text("Note's body text is required");
      }
      else {
        formNoteBody.next().text("");
      }
      if(formNoteValid) {
        if(noteId !== "") {
          for (var i = notes.length - 1; i >= 0; i--) {
            if(notes[i].id === parseInt(noteId)) {
              notes[i].title = formNoteTitle.val();
              notes[i].body = formNoteBody.val();
            }
          }
        }
        else {
          if(notes.length === 0) {
            noteId = 1;
          }
          else {
            noteId = notes[notes.length-1].id + 1
          }
          newNote = {
            title: formNoteTitle.val(),
            body: formNoteBody.val(),
            userId: currentUser.id,
            id: noteId
          }

          notes.push(newNote);
        }
        init("list");
      }
      formNote.attr("note-id", "");
    }

    return {
      start
    }
  })();

  feature.start();
});
