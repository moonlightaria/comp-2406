function attend(workshop){
  let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("attend").value = xhttp.response;
			location.replace(`${window.location.protocol}//${window.location.host}`);
		}
	};
	xhttp.open("POST", `http://localhost:3000/workshops/${workshop}`, true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send();
}