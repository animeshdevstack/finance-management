const Express = require("express");
const cors = require("cors");
const userRouter = require("./routes/auth.routes");
const configuration = require("./config/configuration");
const Connection = require("./libs/connection");
const categoryRouter = require("./routes/category.routes");
const historyExpenseRouter = require("./routes/history-expense.routes");
const logger = require("./helpers/logger");
const app = new Express();
const appVersion = configuration.version

app.use(cors({
    origin: configuration.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(Express.json());

app.use((req, res, next) => {
    logger.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

const PORT = 8080;

app.get("/", (req, res) => {
  res.send("Money Split App is working!");
});

app.use(appVersion, userRouter)
app.use(`${appVersion}/categories`, categoryRouter)
app.use(`${appVersion}/history-expenses`, historyExpenseRouter)

Connection()

app.listen(PORT, () => {
  logger.log(`Server is started listening on PORT ${PORT}`);
});
