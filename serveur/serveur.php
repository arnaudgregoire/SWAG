<?php
header('Access-Control-Allow-Origin: *');

if(isset($_GET['send'])){
    $send = $_GET["send"];
    echo "bonjour php";
    echo system('test_php.py ' .$send);
}

else{
  //echo shell_exec("python C:/wamp64/www/dev/test_php.py");
  echo system("test_php.py");
  echo "bonjour php";
}
?>
