import express from "express";
import { getAllMessages, getUnseenMessagesCount, markMessagesAsSeen, sendMessage, sendMessageToUser } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const messageRouter = express.Router();


messageRouter.get("/unseen-count",protectRoute,getUnseenMessagesCount);
messageRouter.get("/all-messages/:id",protectRoute,getAllMessages);
messageRouter.put("/mark-seen/:id",protectRoute,markMessagesAsSeen);
messageRouter.post("/send-message/:id",protectRoute,sendMessageToUser)

export default messageRouter;