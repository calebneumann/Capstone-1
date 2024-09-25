<?php
	$username = $_POST['username'];
	$password = $_POST['password'];
	$phone = $_POST['phone'];
	

	// Database connection1
	$conn = new mysqli('localhost','root','','speakommerce');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("insert into registration(username, password, phone) values(?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("sss", $username, $password, $phone );
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		$stmt->close();
		$conn->close();
	}
?>