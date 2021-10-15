//Storing the elements to an array to sort them
let addedElements = [];
let addedText = []; 
function addToList(){
    //Make the new label
    var newItem = document.getElementById("addNewTask").value;
    let label = document.createElement('label');
    label.setAttribute("for","listElement");
    label.setAttribute("class","form-check-label cardInside");
    label.innerText = newItem;
    //add the label to the page
    let parent = document.getElementById("theList");
    parent.prepend(label);
    //add label to array
    addedElements.push(label);
    addedText.push(label.innerHTML)
}
//sorts array of label elements since built in one refuses too

//sorting the list
function sortList(){
    //Grab the list, then remove all elements from the page
    let parent = document.getElementById("theList");
    for(var i =0; i <addedElements.length;i++){
        parent.removeChild(addedElements[i]);
    }
    //sort the items
    addedText.sort();
    addedText.reverse();
    //add them back
    for(var i =0; i <addedElements.length;i++){
        addedElements[i].innerText = addedText[i];
        parent.prepend(addedElements[i]);
    }
}   