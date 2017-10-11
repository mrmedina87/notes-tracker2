$(function() {
  var feature = (function() {
    
    var currentJwt = localStorage.getItem("nt-jwt");
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
    var signinLink = $(".signin-link");

    var newNote = $(".new-note");

    var formNote = $(".edit-note");
    var formNoteh2 = $(".edit-note").find("h2");
    var formNoteSubmit = formNote.find(".form-submit");
    var formNoteTitle = formNote.find(".note-title");
    var formNoteBody = formNote.find(".note-body");

    var formNoteValid = true;
    var notesWarningState = $("section.form-note div.notes-warning-state");
    var notesList = $("section.list ul.notes-list");

    var init = function(state) {
      
      stateApp = state || stateApp;
      var delay = 0;
      clearCredsForm();
      formCredentials.removeClass("show-signup-link");
      formCredentials.removeClass("show-signin-link");
      if(currentJwt) {
        if(stateApp !== "form-note") {
          stateApp = "list";
        }
        formCredentialsTitle.text("Sign in to Notes-tracker");
        formCredentialsSubmit.text("Sign in");
      }
      else {
        if(stateApp === "signup") {
          formCredentialsTitle.html("Registration form"); 
          formCredentialsSubmit.html("Sign up");
          formCredentials.addClass("show-signin-link");
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

      $.ajax({
        type: "GET",
        url: "api/note",
        contentType: "application/json",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", currentJwt);
        },
        success: function(getNotesResponse) {
          if(getNotesResponse && JSON.parse(getNotesResponse).notes) {
            notes = JSON.parse(getNotesResponse).notes;
            for (var i = notes.length - 1; i >= 0; i--) {
              atLeastOne = true;
              newlistItem = listItem.clone();
              newlistItemTitle = listItemTitle.clone().text(notes[i].title);
              newlistItemBody = listItemBody.clone().text(notes[i].content);
              newlistItemEditButton = listItemEditButton.clone();
              newlistItemDeleteButton = listItemDeleteButton.clone();
              
              newlistItemEditButton.click(goToNoteForm.bind({
                  isNew: false,
                  noteId: notes[i].id,
                  noteTitle: notes[i].title,
                  noteContent: notes[i].content
              }));
              newlistItemDeleteButton.click(deleteNote.bind({
                  noteId: notes[i].id
              }));

              newlistItem
                .append(newlistItemTitle)
                .append(newlistItemBody)
                .append(newlistItemEditButton)
                .append(newlistItemDeleteButton);
              
              notesList.append(newlistItem);
            }

            if(!atLeastOne) {
              newlistItem = listItem.clone();
              newlistItem.append($("<span class='no-items-message'></span>").text("Looks like you didn't add notes yet, try adding new items by clicking in the New note button below :)"))
              newlistItem.appendTo(notesList);
            }
          }
          else {
            newlistItem = listItem.clone();
            newlistItem.append($("<span class='no-items-message wrong-response-payload'></span>").text("Response from the server does not have a valid format. Please refresh the browser in order to try again. If this continues, please contact a web admin."))
            newlistItem.appendTo(notesList);
          }
        },
        error: function(e) {
          newlistItem = listItem.clone();
          newlistItem.append($("<span class='no-items-message wrong-response-payload'></span>").text(e.responseJSON.errorMessage));
          newlistItem.appendTo(notesList);
        }
      });
    }
    
    var deleteNote = function(e) {
      e.preventDefault();
      $.ajax({
        type: "DELETE",
        url: "api/note/" + this.noteId,
        contentType: "application/json",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", currentJwt);
        },
        success: function(deleteNoteResponse) {
          if(deleteNoteResponse && JSON.parse(deleteNoteResponse).deleted) {
            init("list");  
          }
        },
        error: function(e) {
          notesList.empty();
          newlistItem = $("<li></li>");
          newlistItem.append($("<span class='no-items-message wrong-response-payload'></span>").text(e.responseJSON.errorMessage + ". Refresh the webapp to go to the list again."));
          newlistItem.appendTo(notesList);
        }
      });
    }

    var goToNoteForm = function() {
      notesWarningState.hide();
      clearNoteForm();
      if(this.isNew === true) {
        formNoteh2.text("New note");
        formNote.attr("note-id", "");
      }
      else {
        formNoteh2.text("Edit note");
        formNote.attr("note-id", this.noteId);
        formNoteTitle.val(this.noteTitle);
        formNoteBody.val(this.noteContent);
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
      signinLink.click(goToSignIn);

      newNote.click(goToNoteForm.bind({isNew: true}));
      formNoteSubmit.click(validateNoteAndSave);
    }

    var logOut =function() {
      setCurrentJwt();
      goToSignIn();
    }

    var goToSignUp = function() {
      init("signup");
    }

    var goToSignIn = function() {
      init("signin");
    }

    var saveAndLogin = function() {
      var usr = {};
      usr.email = formCredentialsUser.val();
      usr.password = formCredentialsPassword.val();
      
      $.ajax({
        type: "POST",
        url: "api/user",
        data: JSON.stringify(usr),
        contentType: "application/json",
        dataType: "json",
        success: function(d) {
          login();
        },
        error: function(e) {
          if(e.status === 409) {
            formCredentialsUser.next().text(e.responseJSON.errorMessage);  
          }
          else {
            formCredentialsPassword.next().text("This user could not be saved. Please try again with different credentials.");  
          }
          
        }
      }); 
    }

    var setCurrentJwt = function(jwt) {
      if(jwt) {
        localStorage.setItem("nt-jwt", jwt);
        currentJwt = jwt;
      }
      else {
        localStorage.removeItem("nt-jwt");
        currentJwt = false;
      }
    }

    var login = function() {
      var usr = {};
      usr.email = formCredentialsUser.val();
      usr.password = formCredentialsPassword.val();

      $.ajax({
        type: "POST",
        url: "api/login",
        data: JSON.stringify(usr),
        contentType: "application/json",
        dataType: "json",
        success: function(d) {
          if(d.successMsj && d.successMsj === "true" && d.token) {
            setCurrentJwt(d.token)
            init("list");
          }
          else {
            formCredentialsPassword.next().text("This user couldn not be logged in. Try again or contact a web admin.");
          }
        },
        error: function(e) {
          formCredentialsPassword.next().text(e.responseJSON.errorMessage);
        }
      });
    }

    var validateCredsAndSend = function(e) {
      e.preventDefault();
      formCredentialsValid = true;
      if (formCredentialsUser.is(":invalid")) {
        formCredentialsValid = false;
        formCredentialsUser.next().text("User field is required and should be filled with email format");
      }
      else {
        formCredentialsUser.next().text("");
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

    var handleUpsertNoteError = function(e) {
      notesWarningState.show();
      if(e.responseJSON && e.responseJSON.errorMessage) {
        notesWarningState.text(e.responseJSON.errorMessage);  
      }
      else {
        notesWarningState.text("We could not reach the server. Please check your internet connection");  
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
        var note = {
          title: formNoteTitle.val(),
          content: formNoteBody.val()
        };
        if(noteId !== "") {
          note.id = noteId;
          $.ajax({
            type: "PUT",
            url: "api/note",
            data: JSON.stringify(note),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", currentJwt);
            },
            success: function(d) {
              init("list");
            },
            error: handleUpsertNoteError
          });
        }
        else {
          $.ajax({
            type: "POST",
            url: "api/note",
            data: JSON.stringify(note),
            contentType: "application/json",
            dataType: "json",
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", currentJwt);
            },
            success: function(d) {
              init("list");
            },
            error: handleUpsertNoteError
          });
        }
        
      }
      formNote.attr("note-id", "");
    }

    return {
      start
    }
  })();

  feature.start();
});
