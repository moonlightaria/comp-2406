//adds action listener to submit
function init(){
    document.getElementById("submit").addEventListener("click", submit);
}
// creates the vendor object to be sent
function getVendor(){
    return {
        name: document.getElementById("name").value,
        delivery_fee: document.getElementById("delivery_fee").value,
        min_order: document.getElementById("min_order").value,
    };
}

//sends the request to the server and redirects upon response
function submit(){
    let vendor = getVendor();
    let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(xhttp.response);
            location.replace(window.location.protocol + "//" + window.location.host + `/vendors/${data.id}`);
		}
	};
	xhttp.open("POST", `/vendors`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(vendor));
}