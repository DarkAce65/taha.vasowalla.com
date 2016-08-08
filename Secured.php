<?php
	session_start();
	$_SESSION["error"] = "";

	if($_POST["username"]) {
		if(($_POST["username"] == "admin") && ($_POST["password"] == "adminpass")) {
			$_SESSION["Secured"] = "Secured";
		}
		else {
			$_SESSION["error"] = "<p style='color: #a94442;'>Incorrect username or password.</p>";
		}
	}

	if(!isset($_SESSION["Secured"])) {
?>

<!DOCTYPE html>
<html>
	<head>
		<title>Login</title>
		<link id="icon" rel="shortcut icon" href="img/TV.png"/>
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" type="text/css" href="bower_components/bootstrap/dist/css/bootstrap.min.css"/>
		<link rel="stylesheet" type="text/css" href="bower_components/fontawesome/css/font-awesome.min.css"/>
		<link rel="stylesheet" type="text/css" href="Stylesheet.css"/>
		<script src="bower_components/jquery/dist/jquery.min.js"></script>
		<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
	</head>
	<body class="modal-open">
		<div class="modal in" style="display: block;">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h4 class="modal-title">Login</h4>
					</div>
					<div class="modal-body">
						<?php echo $_SESSION["error"];?>
						<p>The username is "admin" and the password is "adminpass".</p>
						<form id="Login" method="post" class="form-horizontal">
							<div class="form-group">
								<span class="fancyInput">
									<input id="Username" name="username" type="text">
									<label for="Username" class="floatingLabel">
										<span class="labelContent">Username</span>
									</label>
								</span>
							</div>
							<div class="form-group">
								<span class="fancyInput">
									<input id="Password" name="password" type="password">
									<label for="Password" class="floatingLabel">
										<span class="labelContent">Password</span>
									</label>
								</span>
							</div>
							<div class="form-group" style="margin: 0; text-align: right;">
								<a class="btn btn-default" href="index.html"><span class="fa fa-home"></span> Homepage</a>
								<button type="submit" class="btn btn-primary">Login</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-backdrop in"></div>
		<script type="text/javascript">
			$(".fancyInput input").on("focus", function() {
				$(this.parentNode).addClass("hasText");
			});

			$(".fancyInput input").on("blur", function() {
				if(this.value.trim() == "") {
					$(this.parentNode).removeClass("hasText");
				}
			});
		</script>
	</body>
</html>

<?php
	}
else{
?>

<!DOCTYPE html>
<html>
	<head>
		<title>Logged In</title>
		<link id="icon" rel="shortcut icon" href="img/TV.png"/>
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" type="text/css" href="bower_components/bootstrap/dist/css/bootstrap.min.css"/>
		<link rel="stylesheet" type="text/css" href="bower_components/fontawesome/css/font-awesome.min.css"/>
		<link rel="stylesheet" type="text/css" href="Stylesheet.css"/>
		<script src="bower_components/jquery/dist/jquery.min.js"></script>
		<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
	</head>
	<body>
		<div class="col-md-offset-2 col-md-8 col-lg-offset-3 col-lg-6" style="text-align: center; margin-top: 100px;">
			<div class="page-header" style="margin-top: 0px;">
				<p class="h1">Welcome</p>
			</div>
			<p class="h4">You have been successfully logged in.</p>
			<a class="btn btn-danger" href="Logout.php">Logout</a>
			<a class="btn btn-default" href="index.html"><span class="fa fa-home"></span> Homepage</a>
		</div>
	</body>
</html>

<?php
	}
?>