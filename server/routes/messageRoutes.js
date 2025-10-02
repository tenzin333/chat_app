import express from "express";
import { getAllMessages, getUnseenMessagesCount, markMessagesAsSeen, sendMessageToUser, getRecentChats, getSharedMedia } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const messageRouter = express.Router();


// --- Routes ---
messageRouter.get("/unseen-count", protectRoute, getUnseenMessagesCount);
messageRouter.get("/all-messages/:id", protectRoute, getAllMessages);
messageRouter.put("/mark-seen/:id", protectRoute, markMessagesAsSeen);
messageRouter.post("/send-message/:id", protectRoute, sendMessageToUser);
messageRouter.get("/recent-chats/:id", protectRoute, getRecentChats);
messageRouter.get("/get-shared-media/:id", protectRoute, getSharedMedia);

export default messageRouter;
