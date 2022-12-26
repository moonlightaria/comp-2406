function follow(user){
  let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("follow").value = xhttp.response;
		}
	};
	xhttp.open("POST", `http://localhost:3000/user/${user}/follow`, true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send();
}

function newWorkshop(){
  location.replace(`${window.location.protocol}//${window.location.host}/addWorkshop`);
}
function changeAccountType(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			if(JSON.parse(xhttp.response)){
      	location.replace(`${window.location.protocol}//${window.location.host}/addArt`);
			}else{
				location.replace(`${window.location.protocol}//${window.location.host}`);
			}
		}
	};
	xhttp.open("POST", `http://localhost:3000/user/changeAccountType`, true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send();
}

function newArtwork(){
  location.replace(`${window.location.protocol}//${window.location.host}/addArt`);
}