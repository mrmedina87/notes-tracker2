<?php 
  class Resource {
    protected $method;
    protected $payload;
    protected $link;
    function __construct($method, $payload) {
      $this->method = $method;
      $this->payload = $payload;
      $this->link = new mysqli(DBHOST, DBUSER, DBPASSWORD, DBNAME);
      if ($this->link->connect_errno) {
        echo '{"errorMessage": "Something went wrong while trying to connect to database, please try again."}';
        http_response_code(500);
      }
      $this->link->set_charset('utf8');
    }

    function __destruct() {
      $this->link->close();
    }
  }
?>