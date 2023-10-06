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

function checkIfCookieSet(req) {
  return req.cookies["user_id"];
}

function urlsForUser(id) {
  const filteredResults = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredResults[url] = urlDatabase[url];
    }
  }
  return filteredResults;
}

//URL DB
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

//USERS DB
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//DEFAULT HOMEPAGE ROUTE
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//INITIAL TESTING PURPOSE ROUTES
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//SHOW LIST OF ALL URLS ROUTE
app.get("/urls", (req, res) => {
  //check if user is not logged in then redirect to login page
  if (!checkIfCookieSet(req)) {
    res.send(
      "<html><body><h3>You are not logged in. Please <a href='/login'>login</a> or <a href='/register'>register</a> first.</h3></body></html>\n"
    );
    return;
  }

  for (const user in users) {
    const user_id = req.cookies["user_id"];
    if (users[user].id === user_id) {
      const templateVars = {
        user: users[user],
        urls: urlsForUser(user_id),
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

//CREATE NEW URL PAGE ROUTE
app.get("/urls/new", (req, res) => {
  //check if user is not logged in then redirect to login page
  if (!checkIfCookieSet(req)) {
    res.redirect("/login");
    return;
  }

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

//SHOW PARTICULAR URL ROUTE
app.get("/urls/:id", (req, res) => {
  //if id does not exist
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Does not exist in the urlDatabase.");
  } else {
    for (const user in users) {
      //check if any user is logged in then send user object in temp Vars
      const user_id = req.cookies["user_id"];
      if (users[user].id === user_id) {
        //get user's urls
        const urls = urlsForUser(user_id);
        //check if user is accessing own url
        if (urls[req.params.id]) {
          const templateVars = {
            user: users[user],
            id: req.params.id,
            longURL: urlDatabase[req.params.id].longURL,
          };
          res.render("urls_show", templateVars);
          return;
        } else {
          res.send(
            "<html><body><h3>You are trying to access a url that you do not own.</h3></body></html>\n"
          );
        }
      }
    }
    //if user is not logged in
    res.send(
      "<html><body><h3>You are not logged in. Please <a href='/login'>login</a> first.</h3></body></html>\n"
    );
  }
});

//CREATE NEW URL ROUTE
app.post("/urls", (req, res) => {
  //check if user is not logged in then redirect to login page
  if (!checkIfCookieSet(req)) {
    res.send(
      "<html><body><h3>You are not logged in. Please <a href='/login'>login</a> first.</h3></body></html>\n"
    );
    return;
  }

  const shortURL = generateRandomString();
  //adding shortURL to urlDatabase
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});

//REDIRECT TO LONG URL USING SHORT URL ROUTE
app.get("/u/:id", (req, res) => {
  //if id does not exist
  if (!urlDatabase[req.params.id]) {
    res
      .status(404)
      .send(
        "<html><body><h3>Short URL does not exist in the urlDatabase. Go to <a href='/'>home</a> page</h3></body></html>\n"
      );
  } else {
    //fetch longURL that is set against the shortURL
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
});

//DELETE URL ROUTE
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[`${id}`];
  res.redirect(`/urls`);
});

//UPDATE EXISITNG URL ROUTE
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  //updating longURL in urlDatabase
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//REGISTER ROUTES
app.get("/register", (req, res) => {
  //if user is logged in then redirect to urls page
  if (checkIfCookieSet(req)) {
    res.redirect("/urls");
    return;
  }

  //if user is not logged in then send empty user object
  const templateVars = {
    user: {},
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  //fetching email and password submitted to the form
  const { email, password } = req.body;

  //check if email or password is an empty string
  if (!email || !password) {
    res.status(400).send("Please enter both email and password");
    return;
  }

  //check if email already exists
  if (getUserByEmail(email)) {
    res.status(400).send("Email already exists. Please use another email");
    return;
  }

  const id = generateRandomString();

  //creating a new user
  users[id] = { id, email, password };

  //setting user id as cookie
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//LOGIN ROUTES
app.get("/login", (req, res) => {
  //if user is logged in then redirect to urls page
  if (checkIfCookieSet(req)) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: {},
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  //fetching email and password submitted to the form
  const { email, password } = req.body;

  //check if email or password is an empty string
  if (!email || !password) {
    res.status(400).send("Please enter both email and password");
    return;
  }

  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send("Email does not exist");
    return;
  } else if (user.password !== password) {
    res.status(403).send("Password is incorrect");
    return;
  }

  //setting user id as cookie
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//LOGOUT ROUTE
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
