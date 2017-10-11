<?php 

  include_once 'resource.php';

  class User extends Resource {

    function __construct($method, $payload) {
      parent::__construct($method, $payload);
    }

    function __destruct() {
      parent::__destruct();
    }

    private function isNewUser($email) {
      $queryUser = "SELECT * FROM `users` WHERE `email` = ?";
      $stmt = $this->link->prepare($queryUser);
      $stmt->bind_param("s", $email);
      if($stmt->execute()) {
        $result = $stmt->get_result();
        return $result->num_rows === 0;  
      }
      else {
        echo '{"errorMessage": "Something went wrong while trying to access to the database. Please check your database configuration settings or internet connection."}';
        http_response_code(503);
        exit(); 
      }
    }

    private function sendUser() {
      $isPut = $this->method === 'PUT';
      $validPayload = is_array($this->payload) 
        && array_key_exists("email", $this->payload) 
        && array_key_exists("password", $this->payload);
      if($isPut) {
        // add code to handle payload structure validation for PUT
        echo '{"errorMessage": "We are not supporting users update actions yet. You can just add users and login."}';
        http_response_code(405);
      }

      if($validPayload) {
        $email = $this->payload['email'];
        $password = $this->payload['password'];
        $validParams = is_string($email) && $email !== "" && is_string($password) && $password !== "";
        if(!$isPut) {
          if(!$this->isNewUser($email)) {
            echo '{"errorMessage": "This user email already exists in our database. Please try again with another email address."}';
            http_response_code(409);
            exit();
          }
        }
        /*else {
          // add code to handle payload data type validation for PUT
        }*/

        if($validParams) {
          /*if($isPut) {
            // add code to create UPDATE stmt for PUT method
          else { */

          $upsertNote = "INSERT INTO `users` (`email`, `password`) values (?, ?)";
          $stmt = $this->link->prepare($upsertNote);
          $stmt->bind_param("ss", $email, $password);
          // }
          if($stmt->execute()) {
            // if(!$isPut) {
              echo '{"Inserted": "User succesfully inserted"}'; 
              http_response_code(201); 
            /*}
            else {
              echo '{"Updated": "User succesfully updated"}'; 
            }*/
          }
          else {
            echo '{"errorMessage": "Something went wrong while try ing to save a user, process aborted"}';
            http_response_code(503);
          }
        }
        else {
          echo '{"errorMessage": "The payload data type is wrong. Check it and try again."}';
          http_response_code(400);
          exit();        
        }
      }
      else {
        echo '{"errorMessage": "The payload structure is wrong. Check it and try again."}';
        http_response_code(400);
        exit();        
      }
    }

    function processRequest($request) {
      switch($this->method) {
        case "GET":
          // insert GET code handler here
          echo '{"errorMessage": "We are not supporting retrieve users actions yet. You can just add users and login."}';
          http_response_code(405);
          break;
        case "DELETE":
          // insert DELETE code handler here
          echo '{"errorMessage": "We are not supporting delete users actions yet. You can just add users and login."}';
          http_response_code(405);
          break;
        case "POST":
        case "PUT":
          $this->sendUser();
          break;
        default:
          echo '{"errorMessage": "Method not allowed"}';
          http_response_code(405);
          break;
      }
    }   
  }
?>