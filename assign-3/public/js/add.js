function init(){
    document.getElementById("submit").addEventListener("click", submit);
}

function getVendor(){
    return {
        name: document.getElementById("name").value,
        delivery_fee: document.getElementById("delivery_fee").value,
        min_order: document.getElementById("min_order").value,
    };
}

function submit(){
    let vendor = getVendor();
    let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(xhttp.response);
			window.location = `localhost:300/vendors/${data.id}`;
		}
	};
	xhttp.open("POST", `/addvendor`, true);
	xhttp.send(JSON.stringify(vendor));
}