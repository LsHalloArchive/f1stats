<?php
$credentials = parse_ini_file("credentials.ini");

if(isset($_POST["token"]) && isset($_POST["uid"])) {
    if($_POST["token"] === $credentials["token"] && $_POST["uid"] === $credentials["uid"]) {
        $db = mysqli_connect($credentials['host'], $credentials['user'], $credentials['password'], $credentials['database']);
        if (mysqli_connect_errno()) {
            printf("Connect failed: %s\n", mysqli_connect_error());
            exit();
        }
        $time = mysqli_real_escape_string($db, $_POST["time"]);
        $f1 = mysqli_real_escape_string($db, $_POST["f1"]);
        $f1_5 = mysqli_real_escape_string($db, $_POST["f1_5"]);
        $f1feeder = mysqli_real_escape_string($db, $_POST["f1feeder"]);

        $result = mysqli_query($db, "INSERT INTO f1stats (`time`, `f1`, `f1_5`, `f1feeder`) VALUES ({$time}, {$f1}, {$f1_5}, {$f1feeder})");
        if($result === false) {
            http_response_code(502);
        }
        mysqli_close($db);
        exit();
    } else {
        http_response_code(401);
    }
}
http_response_code(401);

