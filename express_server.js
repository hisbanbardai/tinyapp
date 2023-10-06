const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8081; // default port 8081

//setting ejs as our template engine
app.set("view engine", "ejs");

//body parser library to convert request body from Buffer to string
app.use(express.urlencoded({ extended: true }));

//cookie parser library to parse cookie headers
app.use(cookieParser());

//generate string for shortURL
function generateRandomString() {
  //toString(36) to convert it into base 36 (26 char + 0-9)
  return Math.random().toString(36).slice(2, 8);
}

//user lookup helper function
function getUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  for (const user in users) {
    const user_id = req.cookies["user_id"];
    if (users[user].id === user_id) {
      const templateVars = {
        user: users[user],
        urls: urlDatabase,
      };
      res.render("urls_index", templateVars);
      return;
    }
  }
  const templateVars = {
    user: {},
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  for (const user in users) {
    const user_id = req.cookies["user_id"];
    if (users[user].id === user_id) {
      const templateVars = {
        user: users[user],
      };
      res.render("urls_new", templateVars);
      return;
    }
  }
  const templateVars = {
    user: {},
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //if id does not exist
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Does not exist in the urlDatabase.");
  } else {
    for (const user in users) {
      const user_id = req.cookies["user_id"];
      if (users[user].id === user_id) {
        const templateVars = {
          user: users[user],
          id: req.params.id,
          longURL: urlDatabase[req.params.id],
        };
        res.render("urls_show", templateVars);
        return;
      }
    }
    const templateVars = {
      user: {},
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

app.get("/login", (req, res) => {
  res.render("urls_login");
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user){
    res.status(403).send("Email does not exist");
    return;
  } else if(user.password !== password) {
    res.status(403).send("Password is incorrect");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  //fetching email and password submitted to the form
  const email = req.body.email;
  const password = req.body.password;

  //check if email and password are empty strings
  if (!email || !password) {
    res.status(400).send("Please enter both email and password");
    return;
  }

  //check if email already exists
  if (getUserByEmail(email)) {
    res.status(400).send("Email already exists. Please use another email");
    return;
  }

  //creating a new user
  users[id] = { id, email, password };
  //saving user id as cookie
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
