<?php
header('Content-Type: application/json');
header("access-control-allow-origin: *");

/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/

if ($_GET["type"] == "playlist") {
    if (isset($_GET["url"])) {
        $url = urlencode($_GET["url"]);
        $pag = 0;
        if (isset($_GET["p"])) {
            $pag = $_GET["p"];
        }
        $page = file_get_contents("http://www.goear.com/apps/android/search_playlist_json.php?q=" . $url . "&p=" . $pag);
        echo $page;
    }
} else if ($_GET['type'] == "songs") {
    if (isset($_GET["url"])) {
        $url = urlencode($_GET["url"]);
        $pag = 0;
        if (isset($_GET["p"])) {
            $pag = $_GET["p"];
        }        

        $url_end = "http://www.goear.com/apps/android/search_songs_json.php?q=" . $url . "&p=" . $pag;

        $options = array(
            "http"=>array(
                "header"=>"User-Agent: Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.102011-10-16 20:23:10\r\n" // i.e. An iPad
            )
        );

        $context = stream_context_create($options);
        $result = file_get_contents($url_end, false, $context);
        echo $result;
    }
} else if ( $_GET['type'] == "list" ) {
    if (isset($_GET["url"])) {
        $url = htmlentities($_GET["url"]);
        $page = file_get_contents("http://www.goear.com/apps/android/playlist_songs_json.php?v=" . $url);
        echo $page;
    }
} else if ( $_GET['type'] == "radio" ) {
	if (isset($_GET["url"])) {

		$url = htmlentities($_GET["url"]);
		$params= [
			'band' => $url
		];

		$ch = curl_init('http://www.goear.com/action/bands/getrelatedband');
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		$result=curl_exec($ch);
		curl_close ($ch);

		$pag = 0;
    if (isset($_GET["p"])) {
        $pag = htmlentities($_GET["p"]);
    }

    $result =  '["'.$url. '",' .substr($result, 1);

		$ch1 = curl_init('http://www.goear.com/action/bands/getrelatedbandsounds');
		curl_setopt($ch1, CURLOPT_POST, TRUE);
		curl_setopt($ch1, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch1, CURLOPT_POSTFIELDS, ['band' => $result, 'p'=>$pag]);
		$page=curl_exec($ch1);
		curl_close ($ch1);

		echo $page;
	}
}/* else if ( $_GET['type'] == "listen" ) {
    header('Content-Type: audio/mpeg');
    if (isset($_GET["url"])) {
        $url = htmlentities($_GET["url"]);
        $page = file_get_contents("http://localhost/radio/escuchar.php?url=".$url );
        echo $page;
    }
}*/
