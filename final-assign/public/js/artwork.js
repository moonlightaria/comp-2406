function like(artwork){
  let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
      document.getElementById(`${artwork}Like`).value = xhttp.response;
		}
	};
	xhttp.open("POST", `http://localhost:3000/artwork/${artwork}/like`, true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send();
}

function review(artwork){
	console.log(artwork);
  document.getElementById(`${artwork}ReviewSpace`).innerHTML = `<div id="${artwork}SendReview"> <textarea id="${artwork}ReviewText" rows=4 cols=50></textarea>` +
    `<button type=button onclick="sendReview('${artwork}')">submit review</button>`;
}

function sendReview(artwork){
	let data = {content:document.getElementById(`${artwork}ReviewText`).value};
  let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
      document.getElementById(`${artwork}Review`).innerHTML = xhttp.response;
      document.getElementById(`${artwork}SendReview`).remove();
		}
	}; 
	xhttp.open("POST", `http://localhost:3000/artwork/${artwork}/review`, true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(data));
}
function deleteReview(artwork){
  let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
      document.getElementById(`${artwork}Review`).innerHTML = "";
		}
	}; 
	xhttp.open("DELETE", `http://localhost:3000/artwork/${artwork}/review`, true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send();
}
