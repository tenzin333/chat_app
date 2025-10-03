import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from './lib/db.js';
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import ablyRouter from "./routes/ablyRoutes.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json({ limit: "4mb" }));

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ably", ablyRouter);

// Connect to DB first, then start server
await connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
