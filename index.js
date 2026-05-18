require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const errorMiddleware = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLoggerMiddleware");

const userRoutes = require("./modules/user/userRoutes");
const projectRoutes = require("./modules/project/projectRoutes");
const taskRoutes = require("./modules/task/taskRoutes");
const memberRoutes = require("./modules/member/memberRoutes");

const app = express();



// ==========================
// SECURITY MIDDLEWARE
// ==========================
app.use(compression());        //  it minize the size of responce so api become fast
app.use(helmet());             // It reduces attack surface at HTTP level
app.use(cors());               // Controls who is allowed to call your API from a browser



// ==========================
// RATE LIMITER
// ==========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: "Too many requests, please try again later."
});

app.use(limiter);



// ==========================
// BODY PARSER (Built-in)
// ==========================
app.use(express.json());



// ==========================
// CUSTOM MIDDLEWARE
// ==========================
app.use(requestLogger);



// ==========================
// ROUTES
// ==========================
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/member", memberRoutes);



// ==========================
// HEALTH CHECK ROUTE
// ==========================
app.get("/", (req, res) => {
  res.send("WorkPlace Backend Running (PostgreSQL )");
});



// ==========================
// ERROR HANDLING MIDDLEWARE
// ==========================
app.use(errorMiddleware);



// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});