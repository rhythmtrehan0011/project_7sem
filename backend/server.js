const express = require("express");
require("dotenv").config();
const passport = require("passport");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/database");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 4000;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

require("./config/passport")(passport);
app.use(passport.initialize());

const userRoute = require("./routes/user.route");
const profileRoute = require("./routes/profile.route");
const postRoute = require("./routes/post.route");

app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);
app.use("/api/profiles", profileRoute);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

dbConnect().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error("Failed to connect to DB", err);
});
