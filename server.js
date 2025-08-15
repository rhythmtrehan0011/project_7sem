const express = require("express");
require("dotenv").config();
const passport = require("passport");
const dbConnect = require("./config/database");

const app = express();
const port = process.env.PORT || 4000;
require("./config/passport")(passport);
app.use(passport.initialize());

const userRoute = require("./routes/authRoutes");
const profileRoute = require("./routes/profileRoutes");

app.use(express.json());
app.use("/api/User", userRoute);
app.use("/api/Profile", profileRoute);

dbConnect();
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
