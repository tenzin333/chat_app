import express from "express";
import { getAllMessages, getUnseenMessagesCount, markMessagesAsSeen, sendMessageToUser, getRecentChats, getSharedMedia } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const messageRouter = express.Router();

// // --- CORS middleware ---
// messageRouter.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://chat-app-frontend-pearl.vercel.app');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');

//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   next();
// });

// --- Routes ---
messageRouter.get("/unseen-count", protectRoute, getUnseenMessagesCount);
messageRouter.get("/all-messages/:id", protectRoute, getAllMessages);
messageRouter.put("/mark-seen/:id", protectRoute, markMessagesAsSeen);
messageRouter.post("/send-message/:id", protectRoute, sendMessageToUser);
messageRouter.get("/recent-chats/:id", protectRoute, getRecentChats);
messageRouter.get("/get-shared-media/:id", protectRoute, getSharedMedia);

export default messageRouter;
