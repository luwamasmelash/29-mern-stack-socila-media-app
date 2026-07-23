import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'
import { serve } from "inngest/express";
import userRouter from "./routes/userRoutes.js";



dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();


app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())


await connectDB();


// Inngest endpoint
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);
app.use('/api/user', userRouter)
app.get('/', (req, res) => {
  res.send('Server working')
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});