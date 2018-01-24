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

// generate database
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//  urls/new page, pass data to _new template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// a new route for /urls/:id, pass data to _show template
app.get("/urls/:id", (req, res) => {
  console.log(req.params)
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

// a short link to redirect shortURL to compared longURL page
  app.get("/u/:shortURL", (req, res) => {
   let shortURL = req.params.shortURL;
       longURL = urlDatabase[shortURL];
   if(! longURL){
     res.status(404).send("NOT FOUND")
   } else{res.redirect(302, longURL);}

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









// ...............................................

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



