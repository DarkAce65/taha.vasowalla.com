<?php
	session_start();

	if(isset($_SESSION['Secured'])) {
		unset($_SESSION['Secured']); 
	}

	header("Location: Secured.php");
	exit();
?>