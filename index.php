<?php

include_once 'config.php';
include_once 'classes/user.php';
include_once 'classes/note.php';
include_once 'classes/login.php';
include_once 'main.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$input = json_decode(file_get_contents('php://input'), true);
$headers = getallheaders();

if($request[0] === "") {
  $main = new Main();
  $main->showMain();
}

else {
  if($request[0] === "api") {
    $resource = $request[1];
    $login = new Login($method, $input);

    switch($resource) {
      case "login":
        $login->processRequest($request);
        break;
      case "user":
        $user = new User($method, $input);
        $user->processRequest($request);
        break;
      case "note":
        if(isset($headers['Authorization'])) {
          $token = $headers['Authorization'];
          $userId = $login->validateToken($token);
          $note = new Note($method, $input, $userId);
          $note->processRequest($request);
        }
        else {
          echo '{"errorMessage": "Authentication is required to access this resource"}';
          http_response_code(401);
        }
        
        break;
      default:
        echo '{"errorMessage": "Not a good url"}';
        http_response_code(403);
        break;
    } 
  }
  else {
    echo '{"errorMessage": "Not a good url"}';
    http_response_code(403);
  }
}

?>