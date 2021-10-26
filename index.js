const { json } = require("express");
const express = require ( "express" );
const fs = require('fs');
const readTasks = fs.readFileSync("ejs-eg/tasks.json");
var taskString = JSON.parse(readTasks);
var userString = JSON.parse(fs.readFileSync("ejs-eg/users.json"));


// this is a canonical alias to make your life easier, like jQuery to $.
const app = express(); 
app.use(express.urlencoded({ extended: true})); 

// a common localhost test port
const port = 3000; 

app.use(express.static("ejs-eg"));

app.set("view engine", "ejs");


let users = {
    "listOfAllUsers" : [
        {username: "username", password: "password"},
        {username: "potato", password: "mashed"}
    ]
};
var currUsersName = "";
function renderToDoPage(res){
    res.render("ToDo", {username: currUsersName, itemList: taskString.listOfAllTasks});
}
function saveNewUser(newUsername, newPassword){
    userString.listOfAllUsers.push({
        username: newUsername,
        password: newPassword
    });
    fs.writeFile("ejs-eg/users.json", JSON.stringify(userString),function(err){
        if(err){
            console.log("error");
        }
        else{
            console.log("WRITTEN a new user!");
        }
    });
}
//user registration
app.post("/register", (req,res)=>{
    //Make a user
    //Save its username and password to the json file after making sure the inputs are correct
    var validRegistration = true;
    userString.listOfAllUsers.forEach(user =>{
        if(req.body.email === user.username){
            validRegistration = false;
        }
    });
    if(validRegistration && req.body.auth === "todo2021"){
        currUsersName = req.body.email;
        saveNewUser(currUsersName, req.body.passowrd);
        renderToDoPage(res);
    }
    else{
        console.log("Fail");
    }
});
//Checking username and password
app.post("/login", (req, res)=>{
    //read the json file into an array
    users.listOfAllUsers.forEach(user =>{
        if(req.body.Email === user.username && req.body.password === user.password){
            currUsersName = req.body.Email;
            renderToDoPage(res);
        }
    })
});
//Add task to the to do list

var idCounter = taskString.listOfAllTasks.length;
app.post("/addtask", (req, res)=>{
    
    var newTask = req.body.taskInput;
    taskString.listOfAllTasks.push( {
        _id: idCounter,
        text: newTask,
        state: "unclaimed",
        creator: currUsersName,
        isTaskClaimed: false,
        claimingUser: null,
        isTaskDone: false,
        isTaskCleared: false
    });
    idCounter++;
    fs.writeFile("ejs-eg/tasks.json", JSON.stringify(taskString),function(err){
        if(err){
            console.log("error");
        }
        else{
            renderToDoPage(res);
        }
    });
});

app.post("/claim", (req,res)=>{
    idToClaim = req.body.hiddenId;
    taskString.listOfAllTasks.forEach(task =>{
        if(task._id == idToClaim){
            task.state = "claimed";
            task.isTaskClaimed = true;
            task.claimingUser = currUsersName;
            fs.writeFile("ejs-eg/tasks.json", JSON.stringify(taskString),function(err){
                if(err){
                    console.log("error");
                }
                else{
                    renderToDoPage(res);
                }
            });
        }
    });
});

app.post("/abandon", (req,res)=>{
    idToClaim = req.body.hiddenId;
    taskString.listOfAllTasks.forEach(task =>{
        if(task._id == idToClaim ){
            if(req.body.Task === "true"){
                task.state = "finished";
                task.isTaskDone = true;
                
            }
            else{
                task.state = "unclaimed";
                task.isTaskClaimed = false;
                task.claimingUser = null;
            }
            
            fs.writeFile("ejs-eg/tasks.json", JSON.stringify(taskString),function(err){
                if(err){
                    console.log("error");
                }
                else{
                    renderToDoPage(res);
                }
            });
        }
        
    });
});
app.post("/unfinish", (req,res)=>{
    var idToUnfin = req.body.hiddenId;
    taskString.listOfAllTasks.forEach(task =>{
        if(task._id == idToUnfin ){
            task.state = "claimed";
            task.isTaskClaimed = true;
            task.isTaskDone = false;
        }
    });
    fs.writeFile("ejs-eg/tasks.json", JSON.stringify(taskString),function(err){
        if(err){
            console.log("error");
        }
        else{
            renderToDoPage(res);
        }
    });
});
app.post("/purge",(req,res) =>{
    for(var i = 0; i < taskString.listOfAllTasks.length; i++){
        if(taskString.listOfAllTasks[i].isTaskDone){
            taskString.listOfAllTasks.splice(i,1);
            i--;
        }
    }
    fs.writeFile("ejs-eg/tasks.json", JSON.stringify(taskString),function(err){
        if(err){
            console.log("error");
        }
        else{
            renderToDoPage(res);
        }
    });
});
app.post("/logout", (req,res) =>{
    res.redirect("../index.html");
});
// Simple server operation
app.listen (port, () => {
    // template literal
    console.log (`Server is running on http://localhost:${port}`);
});
