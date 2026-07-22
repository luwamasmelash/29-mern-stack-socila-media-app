import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./config/db.js";

import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

await connectDB();

app.use(express.json());
app.use(cors());

// Inngest endpoint
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});