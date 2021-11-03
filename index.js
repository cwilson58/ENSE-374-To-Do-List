/*
Cameron Wilson
SID: 200430766
index.js for ENSE-374 lab 7 due on 10/27/2021
*/
const { json } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const { kStringMaxLength } = require("buffer");
const internal = require("stream");
var taskString = JSON.parse(fs.readFileSync("ejs-eg/tasks.json"));
var userString = JSON.parse(fs.readFileSync("ejs-eg/users.json"));

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();
app.use(express.urlencoded({ extended: true }));

// a common localhost test port
const port = 3000;
// connect to mongoose on port 27017
mongoose.connect("mongodb://localhost:27017/toDoList", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static("ejs-eg"));

app.set("view engine", "ejs");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const taskSchema = new mongoose.Schema({
  _id: Number,
  text: String,
  state: String,
  creator: String,
  isTaskClaimed: Boolean,
  claimingUser: String,
  isTaskDone: Boolean,
  isTaskCleared: Boolean,
});
const Users = mongoose.model("Users", userSchema);
const Tasks = mongoose.model("Tasks", taskSchema);

const user1 = new Users({
  username: "username",
  password: "password",
});
//user1.save();
const user2 = new Users({
  username: "potato",
  password: "mashed",
});
//user2.save();
const task1 = new Tasks({
  _id: 1,
  text: "Get Milk",
  state: "claimed",
  creator: "potato",
  isTaskClaimed: true,
  claimingUser: "username",
  isTaskDone: false,
  isTaskCleared: false,
});
//task1.save();
const task2 = new Tasks({
  _id: 2,
  text: "Sleep",
  state: "claimed",
  creator: "potato",
  isTaskClaimed: true,
  claimingUser: "username",
  isTaskDone: false,
  isTaskCleared: false,
});
//task2.save();
const task3 = new Tasks({
  _id: 3,
  text: "Do ENSE 374 Lab 7",
  state: "unclaimed",
  creator: "username",
  isTaskClaimed: false,
  claimingUser: null,
  isTaskDone: false,
  isTaskCleared: false,
});
//task3.save();
const task4 = new Tasks({
  _id: 4,
  text: "Pay Attention in class",
  state: "claimed",
  creator: "potato",
  isTaskClaimed: true,
  claimingUser: "potato",
  isTaskDone: false,
  isTaskCleared: false,
});
//task4.save();
const task5 = new Tasks({
  _id: 5,
  text: "Drink more coffee",
  state: "claimed",
  creator: "username",
  isTaskClaimed: true,
  claimingUser: "potato",
  isTaskDone: false,
  isTaskCleared: false,
});
//task5.save();

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

mongoose.connection.close();
