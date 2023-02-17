const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// session cookie
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local");

const bcrypt = require("bcrypt");
const saltRound = 10;

const User = require("./model/User");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// session setting
app.use(
  session({
    secret: "randomlongstringforsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// passport setting
app.use(passport.initialize());
app.use(passport.session());

// passport-local-mongoose setting
passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// google login settings
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    User.find({ secret: { $ne: null } }, (error, foundData) => {
      res.render("secrets", { userSecret: foundData });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err, result) => {
    if (err) res.redirect("/login");

    passport.authenticate("local")(req, res, () => {
      res.redirect("/secrets");
    });
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/secrets");
  }
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (error, user) => {
      if (error) res.redirect("/register");
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  );
});

app.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", (req, res) => {
  const secretMessage = req.body.secret;

  User.findById(req.user.id, (error, findUser) => {
    if (error) return console.log("Data not found");

    findUser.secret.push(secretMessage);
    findUser.save();
    res.redirect("/secrets");
  });
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return console.log(error);
    res.redirect("/");
  });
});

// app.use((req, res) => {
//   res.status(404);
//   res.send("<h1>Not Found</h1>");
// });

app.listen(3000, () => console.log("connected"));
