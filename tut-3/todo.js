let checkboxes = [];
let counter = 0;
function init(){
    document.getElementById("input").onsubmit = add;
    document.getElementById("remove").onclick = remove;
    document.getElementById("highlight").onclick = highlight;

}
function add(e){
    e.preventDefault();
    let c = {
        "value": e.target.elements["text"].value,
        "highlight": false,
    }
    checkboxes.push(c);
    e.target.elements["text"].value = "";
    document.getElementById("options").innerHTML += createElement(checkboxes[checkboxes.length-1].value, false);
    
}
function remove(){
    let checkedboxs = document.querySelectorAll('input[name="option"]:checked');
    checkedboxs.forEach((box) => {
        document.getElementById(box.id + " text").remove();
        checkboxes.remove()
        box.remove();
    });
}
function sort(){
    checkboxes.sort((a, b) => a.value.localeCompare(b.value));
    document.getElementById("options").innerHTML = checkboxes.map(createElement(value,highlight)).concat();
}
function highlight(){
    let checkedboxes = document.querySelectorAll('input[name="option"]:checked');
    checkedboxes.forEach(checkboxes[box.id].highlight = !checkboxes[box.id].highlight);
    document.getElementById("options").innerHTML = checkboxes.map(createElement(value,highlight)).concat();
}

function createElement(value, highlight){
    let newElement = `<input type="checkbox" id=${counter} name="option" form="checklist">`;
    newElement += `<label id="${counter + " text"}"`;
    if (highlight){
        newElement += `color="red"`
    }
    newElement += `>${value}<br>`;
    return newElement;
}