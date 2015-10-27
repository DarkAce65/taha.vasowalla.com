<?php
	$url = $_POST['url'];
	$xml = file_get_contents($url);
	$xml = simplexml_load_string($xml);
	print_r(json_encode($xml));
?>