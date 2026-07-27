import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

dotenv.config();

const app = express();

app.use(cors());

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

app.use(express.json());

app.use(clerkMiddleware());

await connectDB();

app.get("/", (req, res) => {
  res.send("Server working");
});

app.listen(4000, () => {
  console.log("Server running");
});