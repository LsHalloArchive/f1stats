<?php
$credentials = parse_ini_file("credentials.ini");

if(isset($_POST["token"]) && isset($_POST["uid"])) {
    if($_POST["token"] === $credentials["token"] && $_POST["uid"] === $credentials["uid"]) {
        if(isset($POST['test'])) {
            exit('Ok');
        }
        $db = mysqli_connect($credentials['host'], $credentials['user'], $credentials['password'], $credentials['database']);
        if (mysqli_connect_errno()) {
            printf("Connect failed: %s\n", mysqli_connect_error());
            http_response_code(503);
            exit("Internal server error");
        }
        $time = mysqli_real_escape_string($db, $_POST["time"]);
        $f1 = mysqli_real_escape_string($db, $_POST["f1"]);
        $f1_5 = mysqli_real_escape_string($db, $_POST["f1_5"]);
        $f1feeder = mysqli_real_escape_string($db, $_POST["f1feeder"]);

        $f1_subs = mysqli_real_escape_string($db, $_POST["f1_subs"]);
        $f1_5_subs = mysqli_real_escape_string($db, $_POST["f1_5_subs"]);
        $f1feeder_subs = mysqli_real_escape_string($db, $_POST["f1feeder_subs"]);

        $result = mysqli_query($db, "INSERT INTO f1stats (`time`, `f1`, `f1_5`, `f1feeder`, `f1_subs`, `f1_5_subs`, `f1feeder_subs`) VALUES ({$time}, {$f1}, {$f1_5}, {$f1feeder}, {$f1_subs}, {$f1_5_subs}, {$f1feeder_subs})");
        if($result === false) {
            http_response_code(503);
            exit("Internal server error");
        }
        mysqli_close($db);
        exit("Ok");
    } else {
        http_response_code(401);
        exit("Unauthorized");
    }
}
http_response_code(401);
exit("Unauthorized");

