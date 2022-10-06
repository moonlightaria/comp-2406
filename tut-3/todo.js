let checkboxes = [];

function init(){
    document.getElementById("input").onsubmit = add;
    document.getElementById("remove").onclick = remove;
    document.getElementById("highlight").onclick = highlight;
    document.getElementById("sort").onclick = sort;

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
        checkboxes.splice(box.id, 1);
        box.remove();
    });
}
function sort(){
    checkboxes.sort((a, b) => a.value.localeCompare(b.value));
    recreateElements();
}
function highlight(){
    let checkedboxes = document.querySelectorAll('input[name="option"]:checked');
    checkedboxes.forEach((box) => {
        temp = checkboxes.find((item) => item.value === box.id);
        console.log(temp);
        temp.highlight = !temp.highlight;
    });
    recreateElements();
}

function createElement(value, highlight){
    let newElement = `<input type="checkbox" id=${value} name="option" form="checklist">`;
    newElement += `<label id="${value + " text"}"`;
    if (highlight){
        newElement += `style="color:red"`
        console.log("highlight");
    }
    newElement += `>${value}<br>`;
    return newElement;
}
function recreateElements(){
    document.getElementById("options").innerHTML = 
      checkboxes.map((box) => createElement(box.value,box.highlight)).join(" ");
}