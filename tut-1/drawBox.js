// Convert into a drawBox function
drawBox(2, 6);
drawBox(5, 4, "?");
function drawBox(numRows, numCols, boxChar = "X") {
  for (let r = 0; r < numRows; r++) {
    let line = "";
    for (let c = 0; c < numCols; c++) {
      line += boxChar;
    }
    console.log(line);
  }
}
