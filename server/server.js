import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from './lib/db.js';
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// CORS - allow all origins (apply once, before routes)
app.use(cors());

// Initialize socket with matching CORS config
export const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Store online users
export const userSocketMap = {}; //{userId:socketId}

// Socket connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        io.emit("online-users", Object.keys(userSocketMap));
    }
    
    socket.on("disconnect", () => {
        if (userId) {
            delete userSocketMap[userId];
            io.emit("online-users", Object.keys(userSocketMap));
        }
    });
});

// Middleware
app.use(express.json({ limit: "4mb" }));

// Routes setup
app.use("/api/status", (req, res) => { res.send("Server is live"); });
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to db 
await connectDB();

if (process.env.NODE_ENV != "production") {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server is running on " + PORT));
}

export default server;