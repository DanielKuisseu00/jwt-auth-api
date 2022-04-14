const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");

// middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// imported controllers
const authRoute = require("./controllers/auth");

// routes
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`running on port, ${PORT}`);
});
