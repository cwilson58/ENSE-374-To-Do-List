
var newId = "newTask";
var newBtnId = "claimBtn";
var counter = 0; //used to make an id not match another until it hits the max, but thats (2^53) -1 so we better not hit it

$(document).ready( () => {
    $( "#add-btn" ).on( "click", () => {
        event.preventDefault(); //Stop the refresh
        //Make the new task
        let taskInp = $( "#newTaskInp" );
        //Make this as a div
        var newTask = $("<div class=\"cardInside clearfix\" id=" + newId + counter + "></div>");
        var newLbl = $("<label for=" + newId + counter + "></label>");
        newLbl.text(taskInp.val());
        newTask.append(newLbl);
        $( "#unclaimedTasks" ).append(newTask);
        $( "#newTask" + counter ).append("<button class=\"btn btn-border rightSide\" id=" + newBtnId + counter +">claim</button>"); //Why does this work!
        counter++;
    
        taskInp.val(''); //clear the box
        //How to add listeners? add it to all buttons?

    })
})

$ ( "#rmv-btn" ).on( "click", () => {
    //for each child of the unfinished list
    document.getElementById("unfinished").childNodes.forEach(element => {
        if(element.firstChild != null){
            if(element.firstChild.lastChild.checked){
                $(element).remove();
            }
        }
    }); 
})

document.getElementById("unclaimedTasks").addEventListener("click", function(e){   
    event.preventDefault(); 
    if(e.target.innerHTML == "claim"){
        let newClaimedDiv = document.createElement('div');
        let theSpan = document.createElement('span');
        let abandonBtn = document.createElement('button');
        abandonBtn.classList.add("btn");
        abandonBtn.classList.add("btn-border");
        abandonBtn.classList.add("ms-auto");
        abandonBtn.classList.add("rightSide");
        abandonBtn.innerHTML = "Abandon";


        theSpan.classList.add("input-group-text");
        let chxBox = document.createElement('input');
        chxBox.type = "checkbox";
        chxBox.classList.add("form-check-input");
        theSpan.append(chxBox);

        newClaimedDiv.classList.add("input-group");
        newClaimedDiv.classList.add("cardInside");
        newClaimedDiv.append(theSpan);
        let newLbl = document.createElement('label');
        newLbl.innerHTML = e.target.parentNode.firstChild.innerHTML;
        newClaimedDiv.append(newLbl);
        newClaimedDiv.append(abandonBtn);
        document.getElementById("unfinished").append(newClaimedDiv);
        $(e.target.parentNode).remove();
    }

});

document.getElementById("unfinished").addEventListener("click", function(e){

    if(e.target.type == "checkbox"){
        if(e.target.checked){
           $(e.target.parentNode.parentNode.childNodes[1]).addClass("lineThrough");
           e.target.parentNode.parentNode.lastChild.style.display = "none";
        }
        else{
            $(e.target.parentNode.parentNode.childNodes[1]).removeClass("lineThrough");
            e.target.parentNode.parentNode.lastChild.style.display = "block";
        }
        return true;
    }
    event.preventDefault();
    if(e.target.innerHTML == "Abandon"){

        //Make this as a div
        var newTask = $("<div class=\"cardInside clearfix\" id=" + newId + counter + "></div>");
        var newLbl = $("<label for=" + newId + counter + "></label>");
        newLbl.text(e.target.previousSibling.innerHTML);
        newTask.append(newLbl);

        $( "#unclaimedTasks" ).append(newTask);
        $( "#newTask" + counter ).append("<button class=\"btn btn-border rightSide\" id=" + newBtnId + counter +">claim</button>");

        counter++;
        $(e.target.parentNode).remove();
    }

})
