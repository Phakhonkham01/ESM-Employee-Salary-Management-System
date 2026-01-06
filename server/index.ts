import express, { Application } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./routes/userRoute.js";
import cors from "cors";

const app: Application = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

const PORT: number = parseInt(process.env.PORT || "7000", 10);
const MONGOURL: string = process.env.MONGO_URL as string;

mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("DB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port :${PORT}`);
    });
  })
  .catch((error: Error) => console.log(error));

app.use("/api", route);