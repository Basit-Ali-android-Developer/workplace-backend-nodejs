const logger = require("../utils/logger/logger");

const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;

    logger.info({
      type: "REQUEST",
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration_ms: Number(duration.toFixed(2))
    });
  });

  next();
};

module.exports = requestLogger;