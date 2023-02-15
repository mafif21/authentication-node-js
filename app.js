const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");

const User = require("./model/User");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;

  User.findOne({ username: userName }, (error, findData) => {
    if (error) return console.log("Data not found");

    if (!findData) {
      res.redirect("/login");
    } else {
      if (findData.password != password) {
        res.redirect("/login");
      } else {
        res.render("secrets");
      }
    }
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;

  const newUser = new User({
    username: userName,
    password: password,
  });

  newUser.save((err) => {
    if (err) return console.log("cant add account");
    res.render("login");
  });
});

app.use((req, res) => {
  res.status(404);
  res.send("<h1>Not Found</h1>");
});

app.listen(3000, () => console.log("connected"));
