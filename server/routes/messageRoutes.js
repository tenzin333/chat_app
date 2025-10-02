import express from "express";
import { getAllMessages, getUnseenMessagesCount, markMessagesAsSeen, sendMessage, sendMessageToUser,getRecentChats,getSharedMedia } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const messageRouter = express.Router();

// CORS middleware for this router
// messageRouter.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
//     if (req.method === 'OPTIONS') {
//         return res.status(200).end();
//     }
//     next();
// });

messageRouter.get("/unseen-count",protectRoute,getUnseenMessagesCount);
messageRouter.get("/all-messages/:id",protectRoute,getAllMessages);
messageRouter.put("/mark-seen/:id",protectRoute,markMessagesAsSeen);
messageRouter.post("/send-message/:id",protectRoute,sendMessageToUser);
messageRouter.get("/recent-chats/:id",protectRoute,getRecentChats);
messageRouter.get("/get-shared-media/:id",protectRoute,getSharedMedia)

export default messageRouter;