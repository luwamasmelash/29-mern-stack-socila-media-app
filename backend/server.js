import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import userRouter from './routes/userRoutes.js'
import postRouter from './routes/postRoutes.js'
import storyRouter from './routes/storyRoutes.js'
import messageRouter from './routes/messageRouter.js'

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(clerkMiddleware());

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messageRouter)

await connectDB();

app.get("/", (req, res) => {
  res.send("Server working");
});

app.listen(4000, () => {
  console.log("Server running");
});