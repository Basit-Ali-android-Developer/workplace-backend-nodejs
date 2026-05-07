require("dotenv").config();

const express = require("express");
const cors = require("cors");

const errorMiddleware = require("./middleware/errorMiddleware");


const userRoutes = require("./modules/user/userRoutes");

const app = express();


app.use(cors());
app.use(express.json()); 


app.use("/api/user", userRoutes);


app.get("/", (req, res) => {
  res.send("WorkPlace Backend Running  (PostgreSQL)");
});


app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});