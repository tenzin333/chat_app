import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import {connectDB} from './lib/db.js';  
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import {Server} from "socket.io";

const app = express(); 
const server = http.createServer(app); //socket supports http server

//initialize socket
export const io = new Server(server,
    {cors:{origin:"*"}}
);

//store online users
export const userSocketMap = {};  //{userId:socketId}

//socket connection handler
io.on("connection",(socket) => {
    const userId = socket.handshake.query.userId;
    console.log("New connection with userId: ",userId);
    userSocketMap[userId] = socket.id;
    io.emit("online-users",Object.keys(userSocketMap));
    socket.on("disconnect",() => {
        console.log("User disconnected",userId);
        delete userSocketMap[userId];
        io.emit("online-users",Object.keys(userSocketMap));
    });
})


//middleware
app.use(express.json({limit:"4mb"}));
app.use(cors());

//routes setup
app.use("/api/status",(req,res) => {res.send("Server is live");})
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

//connect to db 
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,() => console.log("Server is running on "+PORT))
