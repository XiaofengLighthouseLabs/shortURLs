const express = require("express");
const app = express();
// default port 8080
const PORT = process.env.PORT || 8080;
// use EJS for views
app.set("view engine", "ejs");
// POST method, access POST request parameter, such as req.body.longURL
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// for cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// for cookie-session
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["secret"]}));
// for encyrptsfor password

const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur";
const hashedPassword = bcrypt.hashSync(password, 10);
// generate database
const urlDatabase = {
  "b2xVn2": {"longURL":"http://www.lighthouselabs.ca",
             "userId":"userRomID"},

  "9sm5xK": {"longURL":"http://www.google.com",
             "userId":"user2RandomID"}
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
};
// generate random short number for Id
function generateRandomString(){
  var randomShortString = "";
  var inputString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
     randomShortString += inputString[Math.floor(Math.random() * inputString.length)];
  }
  return randomShortString;
}


function urlsForUser(id){
  var newDatabase = {};
  for (regUses in urlDatabase) {
    if (urlDatabase[regUses]["userId"] === id) {
      newDatabase[regUses] = urlDatabase[regUses];
    }
  }
  return newDatabase;
}
// ........................................................
// Endpoints,routilng functions go here
// registers a handler on the root path,alsways pass data to main page
// app.get("/", (req, res) => {
//   res.end("Hello!");
// });
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
  if (req.session.user_id){
    let templateVars = {
      urls: urlsForUser(req.session.user_id),
      username: req.session.user_id
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/login"> Login </a>');
  }
});
//  urls/new page, pass data to _new template
app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
      let templateVars = {
      urls: urlsForUser(req.session.user_id),
      username: req.session.user_id
  };
    res.render("urls_new", templateVars);
  } else {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/login"> Login </a>');
  }
});
// a new route for /urls/:id, pass data to _show template, use form in "urls_show" template
app.get("/urls/:id", (req, res) => {
   if (! urlDatabase[req.params.id]) {
    res.status(404).send('Error: 404: Page not found. <a href="/urls"> Go Back </a>');
    return;
  } else if (!req.session.user_id) {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/login"> Login </a>');
    return;
  } else if (urlDatabase[req.params.id]["userId"] !== req.session.user_id) {
    res.status(403).send('Error: 403: This is not your link! Please <a href="/urls"> Go Back </a>');
    return;
  } else {
    let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]["longURL"],
                       username: req.session.user_id};
    res.render("urls_show", templateVars);
  };
});
// a short link to redirect shortURL http://localhost:8080/urlshortURL which compared longURL page
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
      longURL = urlDatabase[shortURL]["longURL"];
  if (! longURL) {
    res.status(404).send("NOT FOUND");
  } else {res.redirect(302, "http://" + longURL);
  }
});
// create login  and register endpoint
app.get("/login", (req, res) => {
  let templateVars = { username: req.session.user_id };
  res.render("login", templateVars);
});

app.get("/register",(req, res) => {
  let templateVars = { username: req.session.user_id };
  if (req.session.user_id){
    res.redirect("/login");
  }
  res.render("register", templateVars);
});
// .............for post (want someing new)
// input longURL from ./urls/new, get the shortURL using generateRandomString function
app.post("/urls", (req, res) => {
  if (req.session.user_id){
    var longURL = req.body.longURL;
    let shortURL = generateRandomString();
  // console.log(longURL, shortURL);
  // console.log(urlDatabase);
  // add this in the urlDatabase
    urlDatabase[shortURL] = { longURL:req.body.longURL,
                            userId: req.session.user_id };
    // show on the ./urls/${shortURL}
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/login"> Login </a>');
  }

});
// post for delete
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]["userId"] === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("Not allowed");
  }
 });
 // post for update
app.post("/urls/:id",(req, res) => {
  if (! urlDatabase[req.params.id]) {
    res.status(404).send('Error: 404: Page not found. <a href="/urls"> Go Back </a>');
    return;
  } else if (!req.session.user_id) {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/login"> Login </a>');
    return;
  } else if (urlDatabase[req.params.id]["userId"] !== req.session.user_id) {
    res.status(403).send('Error: 403: This is not your link! Please <a href="/"> Go Back </a>');
    return;
  } else {
    urlDatabase[req.params.id]["longURL"] = req.body.newlongURL;
    res.redirect("/urls");
  };
 });

 // post for login using cookie
app.post ('/login', (req, res) => {
  // console.log(users)
  for (user in users) {
    // console.log("user: ", user)
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = users[user].id;
      // console.log("user id ", users[user].id);
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send('Wrong Email or Password! <a href="/register">register</a>');
  });

// post for logout
app.post ('/logout', (req, res) => {
  let user = req.cookies;
  req.session.user_id = users[user];
  // res.clearCookie("user_id", users[user]);
  // res.cookie(name, "Username");
  res.redirect("/urls");
  });

// post for register
app.post("/register", (req, res) => {
  for (use in users) {
    if (req.body.email === "" || req.body.pasword === "") {
      res.status (400).send ('E-mail or password field is empty! <a href="/register">Go BACK</a>');
    } else if (req.body.email === users[use].email) {
    res.status(400).send('It is an existing email! <a href="/register">Go BACK</a>');
    }
  }
  let newUserId = generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password:bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = users[newUserId].id;
  // console.log(newUserId);
  res.redirect("/urls");
});
// ...............................................
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



