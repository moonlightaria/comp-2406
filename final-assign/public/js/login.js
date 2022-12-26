function init() {
	document.getElementById("login").addEventListener("click", login);
	document.getElementById("create").addEventListener("click", create);
}

function login() {
	let login = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
	};
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let loggedIn = JSON.parse(xhttp.response);
			if (loggedIn){
				location.replace(`${window.location.protocol}//${window.location.host}`);
			}else{
				alert("account info doesn't exist");
			}
		}
	};
	xhttp.open("POST", "/login", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(login));
}

function create() {
	let login = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
	};
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			let created = JSON.parse(xhttp.response);
			if (created) {
				location.replace(`${window.location.protocol}//${window.location.host}`);
			} else {
				alert("username already exists or account name is not allowed");
			}
		}
	};
	xhttp.open("POST", "/create", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(login));
}