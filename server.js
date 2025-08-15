const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = require("./database/database");

const app = express();
const port = process.env.PORT || 4000;

const userRoute = require("./routes/authRoutes");

app.use(express.json());
app.use("/api/User", userRoute);

dbConnect();
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
