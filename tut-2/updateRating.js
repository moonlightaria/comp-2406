const numStars = 15;

function init(){
    let stars = "Rating: ";
    let buttons = "";
    for (let i=1; i<=numStars; i++){
        stars += `<span id="rating ${i}" style="color:blue">&#9733;</span>`;
        buttons += `<button type="button" onclick="updateRating(${i})">Rate ${i}</button>`;
    }
    document.getElementById("stars").innerHTML = stars;
    document.getElementById("buttons").innerHTML = buttons;
}

function updateRating(newRating){
    for (let i=1; i<=numStars; i++){
        let color = (i>newRating) ? "lightgray" : "blue";
        document.getElementById(`rating ${i}`).style.color = color;
    }
}