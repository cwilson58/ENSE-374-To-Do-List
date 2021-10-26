/*
Cameron Wilson
SID: 200430766
index.js for ENSE-374 lab 7 due on 10/27/2021
*/
const { json } = require("express");
const express = require("express");
const fs = require("fs");
var taskString = JSON.parse(fs.readFileSync("ejs-eg/tasks.json"));
var userString = JSON.parse(fs.readFileSync("ejs-eg/users.json"));

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();
app.use(express.urlencoded({ extended: true }));

// a common localhost test port
const port = 3000;

app.use(express.static("ejs-eg"));

app.set("view engine", "ejs");

var currUsersName = "";
function renderToDoPage(res) {
  res.render("ToDo", {
    username: currUsersName,
    itemList: taskString.listOfAllTasks,
  });
  return;
}
function findStartingId() {
  if (
    taskString.listOfAllTasks[taskString.listOfAllTasks.length - 1]._id <
    taskString.listOfAllTasks.length
  ) {
    return taskString.listOfAllTasks.length;
  } else {
    return (
      taskString.listOfAllTasks[taskString.listOfAllTasks.length - 1]._id + 1
    );
  }
}
function saveNewUser(newUsername, newPassword) {
  userString.listOfAllUsers.push({
    username: newUsername,
    password: newPassword,
  });
  fs.writeFile("ejs-eg/users.json", JSON.stringify(userString), function (err) {
    if (err) {
      console.log("error");
    } else {
      console.log("WRITTEN a new user!");
    }
  });
  return;
}
function writeTaskToFile(res) {
  fs.writeFile("ejs-eg/tasks.json", JSON.stringify(taskString), function (err) {
    if (err) {
      console.log("error");
    } else {
      renderToDoPage(res);
    }
  });
  return;
}
//user registration
app.post("/register", (req, res) => {
  var validRegistration = true;
  userString.listOfAllUsers.forEach((user) => {
    if (req.body.email === user.username) {
      validRegistration = false;
    }
  });
  if (validRegistration && req.body.auth === "todo2021") {
    currUsersName = req.body.email;
    saveNewUser(currUsersName, req.body.passowrd);
    renderToDoPage(res);
    return;
  } else {
    console.log("Fail");
  }
  return;
});
//user login
app.post("/login", (req, res) => {
  //read the json file into an array
  userString.listOfAllUsers.forEach((user) => {
    if (
      req.body.Email === user.username &&
      req.body.password === user.password
    ) {
      currUsersName = req.body.Email;
      renderToDoPage(res);
      return;
    }
  });
});
//add a task to the list
var idCounter = findStartingId();
app.post("/addtask", (req, res) => {
  var newTask = req.body.taskInput;
  taskString.listOfAllTasks.push({
    _id: idCounter,
    text: newTask,
    state: "unclaimed",
    creator: currUsersName,
    isTaskClaimed: false,
    claimingUser: null,
    isTaskDone: false,
    isTaskCleared: false,
  });
  idCounter++;
  writeTaskToFile(res);
  return;
});
//claim a task
app.post("/claim", (req, res) => {
  idToClaim = req.body.hiddenId;
  taskString.listOfAllTasks.forEach((task) => {
    if (task._id == idToClaim) {
      task.state = "claimed";
      task.isTaskClaimed = true;
      task.claimingUser = currUsersName;
    }
  });
  writeTaskToFile(res);
  return;
});
//abandon and complete
app.post("/abandon", (req, res) => {
  idToClaim = req.body.hiddenId;
  taskString.listOfAllTasks.forEach((task) => {
    if (task._id == idToClaim) {
      if (req.body.Task === "true") {
        task.state = "finished";
        task.isTaskDone = true;
      } else {
        task.state = "unclaimed";
        task.isTaskClaimed = false;
        task.claimingUser = null;
      }
    }
  });
  writeTaskToFile(res);
  return;
});
//mark a task as not actually finished
app.post("/unfinish", (req, res) => {
  var idToUnfin = req.body.hiddenId;
  taskString.listOfAllTasks.forEach((task) => {
    if (task._id == idToUnfin) {
      task.state = "claimed";
      task.isTaskClaimed = true;
      task.isTaskDone = false;
    }
  });
  writeTaskToFile(res);
  return;
});
//purge all completed task: Note this does not care about who the user is
app.post("/purge", (req, res) => {
  for (var i = 0; i < taskString.listOfAllTasks.length; i++) {
    if (taskString.listOfAllTasks[i].isTaskDone) {
      taskString.listOfAllTasks.splice(i, 1);
      i--;
    }
  }
  fs.writeFile("ejs-eg/tasks.json", JSON.stringify(taskString), function (err) {
    if (err) {
      console.log("error");
    } else {
      renderToDoPage(res);
    }
  });
  return;
});
app.post("/logout", (req, res) => {
  res.redirect("../index.html");
  return;
});
// Simple server operation
app.listen(port, () => {
  // template literal
  console.log(`Server is running on http://localhost:${port}`);
});
