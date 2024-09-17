<?php
	$username = $_POST['username'];
	$password = $_POST['password'];
	$phone = $_POST['phone'];
	

	// Database connection
	$conn = new mysqli('localhost','root','','test');
	if($conn->connect_error){
		echo "$conn->connect_error";
		die("Connection Failed : ". $conn->connect_error);
	} else {
		$stmt = $conn->prepare("insert into registration(username, password, phone) values(?, ?, ?, ?, ?, ?)");
		$stmt->bind_param("sssssi", $username, $password, $phone );
		$execval = $stmt->execute();
		echo $execval;
		echo "Registration successfully...";
		$stmt->close();
		$conn->close();
	}
?>