<?php
/*
	File:    anagrams.php
	Author:  David Steinberg
	Date:    2012.09.28
	Project: Anagrams
*/

	// Remove white space from our input
	$input = preg_replace('/\s*/','',$_POST["input"]);

	// Get which language they are producing anagrams in
	$language = $_POST["language"];

	// Build the url to call to produce search results
	$url = "http://www.wordsmith.org/anagram/anagram.cgi?anagram=".$input
		."&language=".$language
		."&t=0&d=&include=&exclude=&n=&m=&source=adv&a=y&l=y&q=y&k=0";

	// Hold results in variable and move to the relevant section
	$page = file_get_contents($url);
	$page = substr($page,strpos($page,"candidate words found:")+22);

	$words = array();

	// Hop from line break to line break until the end
	while (strpos($page,"<br>")) {

		// Shorten "page" to next line break
		$page = substr($page,(strpos($page,"<br>"))+4);
		
		// Make sure words in between line breaks begin with a number
		// Conforms format of search results based on url call
		// If it does not, we are beyond search results
		$word = preg_replace('/\s*/','',substr($page,0,(strpos($page,"<br>"))));
		if (!is_numeric($word[0]))
			break;

		// Remove the result's number from the word and add it to the array
		$word = preg_replace('/[0-9.]/','',$word);
		$words[] = $word;
	}

	// Sort word array and send back as JSON
	sort($words);
	echo json_encode($words);

?>