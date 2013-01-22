<?php

	$input = preg_replace('/\s*/','',$_POST["input"]);

	$language = $_POST["language"];

	$url = "http://www.wordsmith.org/anagram/anagram.cgi?anagram=".$input
		."&language=".$language
		."&t=0&d=&include=&exclude=&n=&m=&source=adv&a=y&l=y&q=y&k=0";

	$page = file_get_contents($url);
	$page = substr($page,strpos($page,"candidate words found:")+22);

	$words = array();

	while (strpos($page,"<br>")) {
		$page = substr($page,(strpos($page,"<br>"))+4);
		$word = preg_replace('/\s*/','',substr($page,0,(strpos($page,"<br>"))));
		if (!is_numeric($word[0]))
			break;
		$word = preg_replace('/[0-9.]/','',$word);
		$words[] = $word;
		$count++;
	}

	sort($words);
	echo json_encode($words);

?>
