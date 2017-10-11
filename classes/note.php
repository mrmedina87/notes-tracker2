<?php 

  include_once 'resource.php';
  class Note extends Resource {

    function __construct($method, $payload, $userId) {
      parent::__construct($method, $payload);
      $this->userId = $userId;
    }

    function __destruct() {
      parent::__destruct();
    }

    private function is_positive_integer($str) {
      return (is_numeric($str) && $str > 0 && $str == round($str));
    }

    private function getNotes($id = null) {
      $queryNote = "SELECT * FROM `notes` where `user_id` = ?";
      $isById = isset($id);
      if($isById) {
        $queryNote = $queryNote . " and `id` = ?";
        $stmt = $this->link->prepare($queryNote);
        $stmt->bind_param("ii", $this->userId, $id);
      }
      else {
        $stmt = $this->link->prepare($queryNote);
        $stmt->bind_param("i", $this->userId);
      }
      $stmt->execute();
      $result = $stmt->get_result();
      if( $result ) {
        if($isById && $result->num_rows === 0) {
          echo '{"errorMessage": "The note with id ' . $id . ' does not belong to the user with user_id ' . $this->userId . ', or it does not exist at all. Try again with a different note, please."}';
          http_response_code(404);
          exit();
        }
        echo '{"notes":[';
        for ($i = 0; $i < $result->num_rows; $i++) {
          echo ($i>0?',':'') . json_encode($result->fetch_object());
        }
        echo ']}';
      }
      else {
        echo '{"errorMessage": "Something went wrong while trying to access to the database."}';
        http_response_code(503);
        exit();
      }
    }

    private function deleteNote($id) {
      $deleteNoteStmt = "DELETE FROM `notes` where `user_id` = ? and `id` = ?";  
      $stmt = $this->link->prepare($deleteNoteStmt);
      $stmt->bind_param("ii", $this->userId, $id);
    
      if( $stmt->execute() ) {
        if($stmt->affected_rows > 0) {
          echo '{"deleted": "true"}';
        }
        else {
          echo '{"errorMessage": "The note with id ' . $id . ' does not belong to the user with user_id ' . $this->userId . ', or it does not exist at all. Try to delete a different note, please."}';
          http_response_code(404);
          exit();
        }
      }
      else {
        echo '{"errorMessage": "Something went wrong while trying to delete this note. Please, try again."}';
        http_response_code(503);
        exit();
      }
    }

    private function sendNote() {
      $isPut = $this->method === 'PUT';
      $validPayload = is_array($this->payload) 
        && array_key_exists("title", $this->payload) 
        && array_key_exists("content", $this->payload);
      if($isPut) {
        $validPayload = $validPayload && array_key_exists("id", $this->payload);
      }

      if($validPayload) {
        $title = $this->payload['title'];
        $content = $this->payload['content'];
        $validParams = is_string($title) && $title !== "" && is_string($content) && $content !== "";
        if($isPut) {
          $noteId = $this->payload["id"];
          $validParams = $validParams && $this->is_positive_integer($noteId);
        }
        if($validParams) {
          if($isPut) {
            $noteId = intval($noteId);
            $upsertNote = "UPDATE `notes` SET `title` = ?, `content` = ? WHERE `id` = ? AND `user_id` = ?";
            $stmt = $this->link->prepare($upsertNote);
            $stmt->bind_param("ssii", $title, $content, $noteId, $this->userId);
          }
          else {
            $upsertNote = "INSERT INTO `notes` (`title`, `content`, `user_id`) values (?, ?, ?)";
            $stmt = $this->link->prepare($upsertNote);
            $stmt->bind_param("ssi", $title, $content, $this->userId);
          }
          if($stmt->execute()) {
            if($stmt->affected_rows > 0) {
              if(!$isPut) {
                echo '{"Inserted": "Note succesfully inserted"}';
                http_response_code(201);
              }
              else {
                echo '{"Updated": "Note succesfully updated"}';
              }
            }
            else {
              if(!$isPut) {
                echo '{"errorMessage": "Something went wrong while trying to insert this note to the database. Please, refresh and try again. If error persists, contact an admin."}';
              }
              else {
                echo '{"errorMessage": "Something went wrong while trying to update this note in the database. Please, refresh and try again. If error persists, contact an admin."}';
              }
              http_response_code(404);
              exit();
            }
              
          }
          else {
            echo '{"errorMessage": "Something went wrong while trying to save a note, process aborted"}';
            http_response_code(503);
          }
        }
        else {
          echo '{"errorMessage": "The payload data type is wrong. Check it and try again."}';
          var_dump($this->payload);
          http_response_code(400);
          exit();        
        }
      }
      else {
        echo '{"errorMessage": "The payload structure is wrong. Check it and try again."}';
        var_dump($this->payload);
        http_response_code(400);
        exit();        
      }
    }

    function processRequest($request) {
      switch($this->method) {
        case "GET":
          if(isset($request[2]) && $this->is_positive_integer($request[2])) {
            $id = (int) $request[2];
            $this->getNotes($id);
          }
          else {
            $this->getNotes();
          }
          break;
        case "DELETE":
          if(isset($request[2]) && $this->is_positive_integer($request[2])) {
            $id = (int) $request[2];
            $this->deleteNote($id);
          }
          else {
            echo '{"errorMessage": "You did not add a note id. You do not want to delete all the notes in this user! Please add a specific id."}';
            http_response_code(403);
            exit();
          }
          break;
        case "POST":
        case "PUT":
          $this->sendNote();
          break;
        default:
          echo '{"errorMessage": "Method not allowed"}';
          http_response_code(405);
          break;
      }
    }   
  }
?>