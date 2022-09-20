// Too short
let password = "pass";

// Contains a space
// password = "Contains space";

// Doesn't use a digit
// password = "my-password";

// Repeats first and last 3 chars
// password = "abc123abc";

// Strong password
// password = "StrongPassword1";

// See if function returns an error message or not
let message = testPassword(password);
if (message) {
  console.log(message);
} else {
  console.log("Password accepted.");
}

function testPassword(password) {
  // return "Password must be at least 6 characters.";

  // return "Password may not contain a space.";

  // return "Password must have at least one digit.";

  // return "The password may not begin and end with the same 3 characters.";

  // Everything is good
  return "";
}

// Returns true if n is a string with a single digit, false otherwise
function isSingleDigit(n) {
  let unicodeValue = n.charCodeAt(0);
  return n.length === 1 && unicodeValue >= 48 && unicodeValue <= 57;
}
