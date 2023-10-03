const express = require("express");
const app = express();
const PORT = 8081; // default port 8081

//setting ejs as our template engine
app.set("view engine", "ejs");

//body parser library to convert request body from Buffer to string
app.use(express.urlencoded({ extended: true }));

//generate string for shortURL
function generateRandomString() {
  //toString(36) to convert it into base 36 (26 char + 0-9)
  return Math.random().toString(36).slice(2, 8);
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new.ejs");
});

app.get("/urls/:id", (req, res) => {
  //if id does not exist
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Does not exist in the urlDatabase.");
  } else {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  //adding shortURL to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  //if id does not exist
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Does not exist in the urlDatabase.");
  } else {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[`${id}`];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  //updating longURL in urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
