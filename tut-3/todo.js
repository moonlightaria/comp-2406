let checkboxes = [];

//adds buttons
function init(){
    document.getElementById("input").onsubmit = add;
    document.getElementById("remove").onclick = remove;
    document.getElementById("highlight").onclick = highlight;
    document.getElementById("sort").onclick = sort;

}
//takes the event submition from the add button and uses it to create a new checkbox
function add(e){
    e.preventDefault();
    let c = {
        "value": e.target.elements["text"].value,
        "highlight": false,
    };
    checkboxes.push(c);
    e.target.elements["text"].value = "";
    document.getElementById("options").innerHTML += createElement(checkboxes[checkboxes.length-1].value, false);
    
}
//removes all checked boxes from the array and recreates the checklist
function remove(){
    let checkedboxs = document.querySelectorAll('input[name="option"]:checked');
    checkedboxs.forEach((box) => {
        checkboxes.splice(checkboxes.indexOf(checkboxes.find((item) => item.value === box.id)), 1);
    });
    recreateElements();
}
//sorts the array and recreates the checklist
function sort(){
    checkboxes.sort((a, b) => a.value.localeCompare(b.value));
    recreateElements();
}
//finds all checked boxes and changes there highlight status, recreates the checklist
function highlight(){
    let checkedboxes = document.querySelectorAll('input[name="option"]:checked');
    checkedboxes.forEach((box) => {
        temp = checkboxes.find((item) => item.value === box.id);
        temp.highlight = !temp.highlight;
    });
    recreateElements();
}
//creates a new checkbox to be added to the array
function createElement(value, highlight){
    let newElement = `<div><input type="checkbox" id="${value}" name="option" form="checklist">`;
    newElement += `<label `;
    if (highlight){
        newElement += `style="color:red"`;
        console.log("highlight");
    }
    newElement += `>${value}</label><br></div>`;
    return newElement;
}
//recreates the checklist
function recreateElements(){
    document.getElementById("options").innerHTML = 
      checkboxes.map((box) => createElement(box.value,box.highlight)).join(" ");
}