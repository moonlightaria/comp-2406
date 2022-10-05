// Too short
//let password = "pass";

// Contains a space 
//let password = "Contains space";

// Doesn't use a digit
//let password = "my-password";

// Repeats first and last 3 chars
let password = "abc123abc";

// Strong password
//let password = "StrongPassword1";

// See if function returns an error message or not
let message = testPassword(password);
if (message) {
    console.log(message);
}
else {
    console.log("Password accepted.");
}

function testPassword(password) {
    if (password.length < 6){
        return "Password must be at least 6 characters.";
    }else if (password.indexOf(" ") != -1){
        return "Password may not contain a space.";
    }else if (!containsDigit(password)){
        return "Password must have at least one digit.";
    }else if(password.substr(0,3) === password.substr(-3,3)){
        return "The password may not begin and end with the same 3 characters.";
    }
    // Everything is good
    return "";
}

//Returns true if n is a string with a single digit, false otherwise
function isSingleDigit(n) {
    let unicodeValue = n.charCodeAt(0);
    return n.length === 1 && unicodeValue >= 48 && unicodeValue <= 57;
}
//returns true if string contains a digit, false otherwise
function containsDigit(string){
    return Array.from(string).filter(isSingleDigit).length > 0;
}