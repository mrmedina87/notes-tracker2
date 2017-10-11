<?php 

  include_once 'resource.php';
  include_once 'jwt/JWT.php';
  use \Firebase\JWT\JWT;
  
  class Login extends Resource {

    function __construct($method, $payload) {
      parent::__construct($method, $payload);
    }

    function __destruct() {
      parent::__destruct();
    }

    private function checkUserCredentials($email, $pw) {
      $queryUser = "SELECT * FROM `users` where `email` = ? and `password` = ?";
      $stmt = $this->link->prepare($queryUser);
      $stmt->bind_param("ss", $email, $pw);
      if($stmt->execute()) {
        $result = $stmt->get_result();
        if($result->num_rows === 1) {
          $objResult = $result->fetch_object();
          if(isset($objResult->id)) {
            return $objResult->id;
          }
          else {
            echo '{"errorMessage": "This user does not have an id. Please contact a web admin to delete this user and create a new one for you."}';
          http_response_code(400);
          exit();  
          }
        }
        else {
          echo '{"errorMessage": "This credentials do not match any of our users database. Please sign-in again."}';
          http_response_code(401);
          exit();
        }  
      }
      else {
        echo '{"errorMessage": "Something went wrong while trying to access to the database."}';
        http_response_code(503);
        exit();
      }
    }

    function processRequest($request) {
      switch($this->method) {
        case "POST":
          $userId = $this->checkUserCredentials($this->payload["email"], $this->payload["password"]); 
          $jwt = JWT::encode($this->payload, SECRETKEY);
          echo '{"successMsj": "true", "token": "' . $jwt . '"}';
          http_response_code(201);
          break;
        default:
          echo '{"errorMessage": "Method not allowed"}';
          http_response_code(405);
          break;
      }
    } 

    function validateToken($token) {
      try {
        $decodedUser = JWT::decode($token, SECRETKEY, array('HS256'));  
      }
      catch(Exception $e) {
          echo '{"errorMessage": "Something went wrong while trying to process this session token. You are not authorized. Aborting: ' . $e->getMessage() . '."}';
          http_response_code(401);
          exit();
      }
      
      $userId = $this->checkUserCredentials($decodedUser->email, $decodedUser->password);
      return $userId;      
    }
  }
?>