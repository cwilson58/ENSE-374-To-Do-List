/*
Cameron Wilson
SID: 200430766
index.js for ENSE-374 labs
*/
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config();

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

app.use(express.static("public"));
// 2. Create a session. The secret is used to sign the session ID.
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

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
const Users = new mongoose.model("Users", userSchema);
const Tasks = new mongoose.model("Tasks", taskSchema);

// 4. Add our strategy for using Passport, using the local user from MongoDB
passport.use(Users.createStrategy());

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());
//Make and save test users and tasks for the db.
const user1 = new Users({
  username: "username",
  password: "password",
});
const user2 = new Users({
  username: "potato",
  password: "mashed",
});
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
//user1.save();
//user2.save();
//task1.save();
//task2.save();
//task3.save();
//task4.save();
//task5.save();
function renderToDoPage(req, res) {
  Tasks.find((err, tasks) => {
    if (err) {
      console.log(err);
    } else {
      res.render("ToDo", {
        username: req.user.username,
        itemList: tasks,
      });
    }
  });
  return;
}
//updated to work with db and async
async function findStartingId() {
  var nextAVailId = 0;
  let taskIds = await Tasks.find().distinct("_id");
  taskIds.forEach((element) => {
    if (parseInt(element) >= nextAVailId) {
      nextAVailId = parseInt(element) + 1;
    }
  });
  return nextAVailId;
}
//user registration
app.post("/register", (req, res) => {
  console.log("User " + req.body.username + " is attempting to register");
  Users.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, () => {
          renderToDoPage(req, res);
        });
      }
    }
  );
});
//user login
app.post("/login", (req, res) => {
  console.log("User " + req.body.username + " Is attempting to log in!");
  const user = new Users({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, () => {
        renderToDoPage(req, res);
      });
    }
  });
});
//add a task to the list
app.post("/addtask", async (req, res) => {
  var idCounter = await findStartingId(); //wait until we have found an id
  console.log("Adding a new task! with id " + idCounter);
  const newTask = new Tasks({
    _id: idCounter,
    text: req.body.taskInput,
    state: "unclaimed",
    creator: req.user.username,
    isTaskClaimed: false,
    claimingUser: null,
    isTaskdone: false,
    isTaskCleared: false,
  });
  //once the save is done, reRenderThePage
  newTask.save().then(() => {
    console.log("Save complete!");
    renderToDoPage(req, res);
  });
  return;
});
//claim a task
app.post("/claim", async (req, res) => {
  idToClaim = req.body.hiddenId;
  usersName = req.user.username;
  //find the id in the Tasks collection
  //update the state to claimed
  //update claiming user to req.user.username
  await Tasks.findOneAndUpdate(
    { _id: idToClaim },
    { state: "claimed", claimingUser: usersName, isTaskClaimed: true }
  );
  renderToDoPage(req, res);
  return;
});
//abandon and complete
app.post("/abandon", async (req, res) => {
  var idToAbandon = req.body.hiddenId;
  if (req.body.Task === "true") {
    console.log("Finish id: " + idToAbandon);
    await Tasks.findOneAndUpdate(
      { _id: idToAbandon },
      { state: "finished", isTaskDone: true }
    );
  } else {
    console.log("Abandon id: " + idToAbandon);
    await Tasks.findOneAndUpdate(
      { _id: idToAbandon },
      { state: "unclaimed", claimingUser: null, isTaskClaimed: false }
    );
  }
  renderToDoPage(req, res);
  return;
});
//mark a task as not actually finished
app.post("/unfinish", async (req, res) => {
  var idToUnfin = req.body.hiddenId;
  await Tasks.findOneAndUpdate(
    { _id: idToUnfin },
    { state: "claimed", isTaskDone: false, isTaskClaimed: true }
  );
  renderToDoPage(req, res);
  return;
});
//purge all completed task: Note this does not care about who the user is
app.post("/purge", async (req, res) => {
  await Tasks.deleteMany({ state: "finished" });
  renderToDoPage(req, res);
  return;
});
app.get("/logout", (req, res) => {
  console.log("A user is logging out");
  req.logout();
  res.redirect("/");
});
// Simple server operation
app.listen(port, () => {
  // template literal
  console.log(`Server is running on http://localhost:${port}`);
});
//mongoose.connection.close();
