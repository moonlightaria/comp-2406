// Return true if the given username and password are in the "database",
// false otherwise.
function validCredentials(enteredUsername, enteredPassword) {
  // "Database" of usernames and passwords
  let usernames = ["smith", "tron", "ace", "ladyj", "anon"];
  let passwords = ["qwerty", "EndOfLine", "year1942", "ladyj123", "PASSWORD"];

  // Search the usernames array for enteredUsername
  let usernameIndex = usernames.indexOf(enteredUsername);
  let passwordIndex = passwords.indexOf(enteredPassword);
  // Only return true if the enteredUsername is in username, and the
  // same location in passwords is enteredPassword
  return usernameIndex === passwordIndex && usernameIndex != -1;
}

console.log("Login for ladyj: " + validCredentials("ladyj", "ladyj123")); // true
console.log("Login for ace: " + validCredentials("ace", "wrong")); // false
console.log("Login for jake: " + validCredentials("jake", "???")); // false
