import express from "express";
import mongoose from "mongoose";
import compression from "compression";
import cors from "cors";

import { userRoutes } from "./routes/user.routes.js";
import { errorHandler } from "./helper/error_helper.js";
import { postRoutes } from "./routes/post.routes.js";
import { groupRoutes } from "./routes/group.routes.js";

const app = express();
const PORT = 7000;

app.use(compression());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/group", groupRoutes);

app.use(errorHandler);

/** catch 404 and forward to error handler */
app.use("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint doesnt exist",
  });
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unkown error occurred!" });
});

mongoose.Promise = global.Promise;

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8xdx0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`App Running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error occured!", err);
  });
