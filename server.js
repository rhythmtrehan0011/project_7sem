const express = require("express");
require("dotenv").config();
const passport = require("passport");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/database");

const app = express();
const port = process.env.PORT || 4000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
require("./config/passport")(passport);
app.use(passport.initialize());

const userRoute = require("./routes/user.route");
const profileRoute = require("./routes/profile.route");
const postRoute = require("./routes/post.route");

// Routes
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);
app.use("/api/profiles", profileRoute);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const User = require('./models/user.model');
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  } else {
    req.user = null;
    next();
  }
};

// Frontend routes
app.get("/", authenticateUser, (req, res) => {
  res.render('index', { user: req.user });
});

app.get("/signup", (req, res) => {
  res.render('signup');
});

app.get("/login", (req, res) => {
  res.render('login');
});

app.get("/logout", (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

dbConnect();
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
