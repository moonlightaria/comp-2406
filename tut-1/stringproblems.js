function landscape() {
  let stringA = "";
  let stringB = "";

  function flat(size) {
    for (let count = 0; count < size; count++) {
      stringA += " ";
      stringB += "_";
    }
  }

  function hill(size) {
    stringA += " ";
    stringB += "/";
    for (let count = 0; count < size; count++) {
      stringA += "_";
      stringB += " ";
    }
    stringA += " ";
    stringB += "\\";
  }

  //START BUILD SCRIPT (do not change this part)
  flat(3);
  hill(4);
  flat(6);
  hill(1);
  flat(1);
  //END BUILD SCRIPT

  return stringA + "\n" + stringB;
}

console.log("");
console.log(landscape());
