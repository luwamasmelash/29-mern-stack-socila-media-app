import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'
import { serve } from "inngest/express";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRouter.js";



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
app.use(clerkMiddleware())
app.use('/api/user', userRouter)
app.get('/', (req, res) => {
  res.send('Server working')
})
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messageRouter)

console.log("Registered functions:", functions.map(fn => fn.id));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});