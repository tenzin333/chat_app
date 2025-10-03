import cloudinary from "../lib/cloudinary.js";
import { Message } from "../models/message.js";
import Users from "../models/users.js";
import Ably from "ably";


const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });

// Send message to a user via Ably
export const sendMessageToUser = async (req, res) => {
    try {
        const { id: selectedId } = req.params;
        const myId = req.user._id;
        const { messageText, mediaUrl } = req.body;
        let imgUrl = null;

        if (mediaUrl) {
            const upload = await cloudinary.uploader.upload(mediaUrl);
            imgUrl = upload.secure_url;
        }

        const message = await Message.create({
            senderId: myId,
            receiverId: selectedId,
            messageText,
            mediaUrl: imgUrl,
            seen: false
        });

        // Publish to Ably channel for this conversation
        const channelName = `chat-${[myId, selectedId].sort().join("-")}`;
        ably.channels.get(channelName).publish("newMessage", message);

        res.json({ success: true, message });
    } catch (err) {
        console.error("Send message error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

//get unseen messages count for sidebar
export const getUnseenMessagesCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await Users.find({ _id: { $ne: userId } }).select("-password -bio -profilePic -createdAt -updatedAt -__v");

        const usersWithUnseenCount = await Promise.all(filteredUsers.map(async (user) => {
            const unseenCount = await Message.countDocuments({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });
            return { ...user.toObject(), unseenCount };
        }));

        const mappedData = {};
        usersWithUnseenCount.forEach((data) => {
            mappedData[data._id] = data.unseenCount;
        });

        res.json({ success: true, unSeenCountMap: mappedData });

    } catch (err) {
        console.error("Get unseen count error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

//get all messages for selected user
export const getAllMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: selectedId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: selectedId, receiverId: myId },
                { senderId: myId, receiverId: selectedId }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as seen when fetching
        await Message.updateMany(
            { senderId: selectedId, receiverId: myId, seen: false },
            { seen: true }
        );

        res.json({ success: true, messages });
    } catch (err) {
        console.error("Get all messages error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: selectedId } = req.params;

        const result = await Message.updateMany(
            { senderId: selectedId, receiverId: myId, seen: false },
            { seen: true }
        );

        // Publish 'messagesSeen' event via Ably
        const channelName = `chat-${[myId, selectedId].sort().join("-")}`;
        ably.channels.get(channelName).publish("messagesSeen", {
            senderId: myId,
            receiverId: selectedId
        });

        return res.status(200).json({
            success: true,
            updatedCount: result.modifiedCount
        });
    } catch (err) {
        console.error("Mark messages as seen error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};


//fetch recent chats
export const getRecentChats = async (req, res) => {
    try {
        const myId = req.user._id;

        const recentMessages = await Message.aggregate([
            { $match: { $or: [{ senderId: myId }, { receiverId: myId }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gt: ["$senderId", "$receiverId"] },
                            { sender: "$senderId", receiver: "$receiverId" },
                            { sender: "$receiverId", receiver: "$senderId" }
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$lastMessage" } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "senderInfo"
                }
            },
            { $unwind: "$senderInfo" },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiverInfo"
                }
            },
            { $unwind: "$receiverInfo" },
            {
                $project: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", myId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    userName: {
                        $cond: [
                            { $eq: ["$senderId", myId] },
                            "$receiverInfo.userName",
                            "$senderInfo.userName"
                        ]
                    },
                    profilePic: {
                        $cond: [
                            { $eq: ["$senderId", myId] },
                            "$receiverInfo.profilePic",
                            "$senderInfo.profilePic"
                        ]
                    },
                    lastMessage: "$messageText",
                    lastMessageTime: "$createdAt",
                    senderId: 1,
                    receiverId: 1
                }
            }
        ]);

        res.json({ success: true, recentChats: recentMessages });

    } catch (err) {
        console.error("Get recent chats error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Legacy send message (if still used elsewhere)
export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, messageText, mediaUrl } = req.body;
        const newMessage = await Message.create({
            senderId,
            receiverId,
            messageText,
            mediaUrl,
            seen: false
        });

        res.json({ success: true, message: newMessage });
    } catch (err) {
        console.error("Send message error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getSharedMedia = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: selectedId } = req.params;
        const mediaMessages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedId },
                { senderId: selectedId, receiverId: myId }
            ],
            mediaUrl: { $exists: true, $ne: null }
        })
            .sort({ createdAt: -1 })
            .select('mediaUrl messageText senderId receiverId createdAt');

        res.json({ success: true, media: mediaMessages });
    } catch (err) {
        res.json({ success: false, message: err.message })
    }
}