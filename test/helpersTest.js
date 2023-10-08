const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

const testUsers = {
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

const testUrls = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it("should return null with non-existent email", function () {
    const user = getUserByEmail("test@example.com", testUsers);
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID);
  });

  it("should return null with an invalid or empty email", function () {
    const user = getUserByEmail("", testUsers);
    const expectedResult = null;
    assert.strictEqual(user, expectedResult);
  });
});

describe("urlsForUser", function () {
  it("should return an object of valid urls with valid user id", function () {
    const urls = urlsForUser("userRandomID", testUrls);
    const expectedUrls = {
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "userRandomID",
      },
    };
    assert.deepStrictEqual(urls, expectedUrls);
  });

  it("should return an empty object with non-existent user id", function () {
    const urls = urlsForUser("testID", testUrls);
    const expectedUrls = {};
    assert.deepStrictEqual(urls, expectedUrls);
  });
});
