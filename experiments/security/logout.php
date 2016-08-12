<?php
	session_start();

	if(isset($_SESSION['secured'])) {
		unset($_SESSION['secured']); 
	}

	header("Location: index.php");
	exit();
?>