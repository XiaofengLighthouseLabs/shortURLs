const express = require("express");
const app = express();
// default port 8080
const PORT = process.env.PORT || 8080;
// use EJS for views
app.set("view engine", "ejs")

// ............Middleware

// POST method, access POST request parameter, such as req.body.longURL
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// for cookie
var cookieParser = require('cookie-parser')
app.use(cookieParser())

// generate database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


// generate random short number for Id
function generateRandomString() {
  var randomShortString = "";
  var inputString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
     randomShortString += inputString[Math.floor(Math.random() * inputString.length)]
   }
   return randomShortString;
}


// Endpoints,routilng functions go here
// registers a handler on the root path,alsways pass data to main page  (/urls)
app.get("/", (req, res) => {
  res.end("Hello!");
});
/*// adding route containing HTML code
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
// add routes, add additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});*/

// add  /urls page as main page, use res.render() to pass the URL database to my _index template as database
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  username: req.cookies["user"] };
  res.render("urls_index", templateVars);
});

//  urls/new page, pass data to _new template
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["user"],};
  res.render("urls_new", templateVars);
});


// a new route for /urls/:id, pass data to _show template
app.get("/urls/:id", (req, res) => {
  console.log(req.params)
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["user"]};
  res.render("urls_show", templateVars);
});

// a short link to redirect shortURL to compared longURL page
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
      longURL = urlDatabase[shortURL];
  if(! longURL){
  res.status(404).send("NOT FOUND")
   } else {res.redirect(302, longURL);}

});
// create login logout and register endpoint
app.get("/login", (req, res)=>{
   let templateVars = { username: req.cookies["user"],};
   res.render("login", templateVars)
});

app.get("/register",(req, res) =>{
   let templateVars = { username: req.cookies["user"],};
  res.render("register", templateVars)
});

// .............for post (want someing new)
// input longURL from ./urls/new, get the shortURL using generateRandomString function
app.post("/urls", (req, res) => {
  var longURL = req.body.longURL
  let shortURL = generateRandomString();
  // add this in the urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  // show on the ./urls/${shortURL}
  res.redirect(`/urls/${shortURL}`);
});

// post for delete
app.post("/urls/:id/delete", (req, res) =>{
   // delete operation
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
 });

 // post for update
app.post("/urls/:id",(req, res) =>{

  urlDatabase[req.params.id] = req.body.newlongURL;
  res.redirect("/urls");
 });

 // post for login using cookie
app.post ('/login', (req, res) =>{
  for (user in users){
    if(users[user].email === req.body.email && users[user].password === req.body.password){
      res.cookie("user_id", users[user].id);
      res.redirect("/urls");
    }
  }
  res.status(403).send("Wrong Email or Password!");
  });

// post for logout
app.post ('/logout', (req, res) =>{
  let user = req.cookies;
  res.clearCookie("user_id", users[user].id);
  // res.cookie(name, "Username");
  res.redirect("/urls");
  });

// post for register
app.post("/register", (req, res) => {
  for (use in users){
    if (req.body.email == "" || req.body.pasword == ""){
      res.status (400).send ('E-mail or password field is empty! <a href="/  register">Go BACK</a>');
    } else if (req.body.email === users[use].email){
    res.status(400).send('It is an existing email! <a href="/register">Go   BACK</a>');
    }
  }
  let newUserId = generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password:req.body.password,
    };
    res.clearCookie("user_id", users[newUserId].id);
  // console.log(newUserId);
  res.redirect("/urls");

});








// ...............................................

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



