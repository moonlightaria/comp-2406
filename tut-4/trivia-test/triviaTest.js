let questions = 0;  //counts the number of answered questions
let correct = 0;    //counts the number of questions answered correctly
let currentQuestion = null;
let currentAns = null;


function init(){
	document.getElementById("score").innerHTML = `Your score: ${correct}/${questions}`;
	getNextQuestion();
	document.getElementById("submit").onclick = submitAnswer;
}

function getNextQuestion(){
	xhttp = new XMLHttpRequest();

    //This is only going to get called when readyState changes
	xhttp.onreadystatechange = function() {
        //If the response is available and was successful
		if(this.readyState==4 && this.status==200){
			//Take the response text (that is in JSON format), parse it into JS object
			let responseObject = JSON.parse(this.responseText);

            //Extract questions from array and update our array
			currentQuestion = responseObject.results[0];
			console.log(currentQuestion); //look at the object; what keys does it have?

            //render this question on our page
			render();
		}
	};
	//request one question from a web server
	xhttp.open("GET", `https://opentdb.com/api.php?amount=1`);
	xhttp.send();
}

function render(){
	// Implement this function
	// it should display the question (and all four of the answers) on the page
	// you can randomly shuffle the options before displaying them
	let question = `<p> Question: ${currentQuestion.question} </p>`;
	//array to hold all answers
	let answers = JSON.parse(JSON.stringify(currentQuestion.incorrect_answers));
	answers.push(currentQuestion.correct_answer);
	randomizeArray(answers);
	//generates the html for selecting an answer
	let answer = answers.reduce((prev, ans) => {
		let str = `<input type="radio" name="ans" value="${ans}" id="${ans}" onchange="updateAns(this.id)">` + 
		`<label for="${ans}">${ans}</label> <br>`;
		return prev + str;
	}, "");
	document.getElementById("question").innerHTML = question + answer;
}

function submitAnswer(){
	// Implement this function
	// This function runs when the button is clicked, - it should display user's score
	// You can also request for another question from here to continue the game
	if (currentAns == currentQuestion.correct_answer){
		correct++;
	}
	currentAns = null;
	document.getElementById("submit").style = "display: none";
	questions++;
	document.getElementById("score").innerHTML = `Your score: ${correct}/${questions}`;
	getNextQuestion();
}

//you can add other functions.
//shows submit button when answer is chosen
function updateAns(ans){
	currentAns = ans;
	document.getElementById("submit").style = "";
}
//algorithm to randomize an array
function randomizeArray(arr){
	for (let i = arr.length - 1; i > 0; i--){
		let j = Math.floor(Math.random() * (i + 1));
		let temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}
