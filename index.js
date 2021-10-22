const express = require ( "express" );

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express(); 
app.use(express.urlencoded({ extended: true})); 

// a common localhost test port
const port = 3000; 

app.use(express.static("ejs-eg"));

app.set("view engine", "ejs");

//Checking username and password
app.post("/", (req, res)=>{
    if(req.body.Email === 'username' && req.body.password === 'password'){
        res.render("ToDo", {username: req.body.Email});
    }
    //done for testing only should be user feedback
    else{
        console.log("login error");
    }
});

// Simple server operation
app.listen (port, () => {
    // template literal
    console.log (`Server is running on http://localhost:${port}`);
});
