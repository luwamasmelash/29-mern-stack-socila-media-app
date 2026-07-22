import express from "express";
import dotenv from "dotenv";
import cors from "cors";


import { connectDB } from "./config/db.js";
import { inngest, functions } from "./inngest/index.js";

import { serve } from "inngest/express";


dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();


app.use(express.json());
app.use(cors());


await connectDB();


// Inngest endpoint
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);
app.get('/', (req, res) => {
  res.send('Server working')
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});