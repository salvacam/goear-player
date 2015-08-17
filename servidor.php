<?php
header('Content-Type: application/json');
header("access-control-allow-origin: *");

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
        $page = file_get_contents("http://www.goear.com/search/" . $url . "/" . $pag);
        if ($page) {
            $lista = array();
            $posinicial = strpos($page, 'redir');
            $posfinal = strpos($page, "/", $posinicial + 35);
            while ($posinicial) {
                $aux = array();
                $aux[] = substr($page, $posinicial + 35, $posfinal - ($posinicial + 35));
                $posinicial = strpos($page, 'title', $posinicial + 7);
                $posfinal = strpos($page, "\"", $posinicial + 7);
                $aux[] = substr($page, $posinicial + 7, $posfinal - ($posinicial + 7));
                $posinicial = strpos($page, 'artist', $posinicial + 8);
                $posfinal = strpos($page, "\"", $posinicial + 8);
                $aux[] = substr($page, $posinicial + 8, $posfinal - ($posinicial + 8));
                $posinicial = strpos($page, 'Duración', $posinicial + 11);
                $posfinal = strpos($page, "<", $posinicial + 11);
                $aux[] = substr($page, $posinicial + 11, $posfinal - ($posinicial + 11));
                //var_dump($aux);
                $lista[] = $aux;
                $posinicial = strpos($page, 'redir', $posinicial + 35);
                $posfinal = strpos($page, "/", $posinicial + 35);
            }
            if (sizeof($lista) > 0) {
                $salida = '[';
                foreach ($lista as $key => $value) {
                    $salida .= '{"id": "' . $value[0] . '", "title": "' . $value[1] . '", "artist": "' . $value[2] . '", "songtime": "' . $value[3] .'"},';
                }
                $salida = substr($salida, 0, -1);
                echo $salida . ']';
            }
        } else {
            echo '[0]'; // parametro no es una url
        }
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
