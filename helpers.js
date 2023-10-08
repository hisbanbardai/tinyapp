//user lookup helper function
const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

//generate string for shortURL
const generateRandomString = function () {
  //toString(36) to convert it into base 36 (26 char + 0-9)
  return Math.random().toString(36).slice(2, 8);
};

const checkIfCookieSet = function (req) {
  // return req.cookies["user_id"];
  return req.session.user_id;
};

//filter urls for the specific user
const urlsForUser = function (id, database) {
  const filteredResults = {};
  for (url in database) {
    if (database[url].userID === id) {
      filteredResults[url] = database[url];
    }
  }
  return filteredResults;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  checkIfCookieSet,
  urlsForUser,
};
