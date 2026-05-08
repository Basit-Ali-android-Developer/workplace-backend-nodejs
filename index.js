require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const errorMiddleware = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLoggerMiddleware");

const userRoutes = require("./modules/user/userRoutes");

const app = express();



// ==========================
// SECURITY MIDDLEWARE
// ==========================
app.use(compression());
app.use(helmet());
app.use(cors());



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



// ==========================
// HEALTH CHECK ROUTE
// ==========================
app.get("/", (req, res) => {
  res.send("WorkPlace Backend Running (PostgreSQL 🚀)");
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