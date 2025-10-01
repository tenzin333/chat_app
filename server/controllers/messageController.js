import cloudinary from "../lib/cloudinary.js";
import { Message } from "../models/message.js";
import Users from "../models/users.js";
import { io, userSocketMap } from "../server.js";

//send message 
export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, messageText, mediaUrl } = req.body;
        const newMessage = await Message.create({
            senderId,
            receiverId,
            messageText,
            mediaUrl,
            seen: false
        })


    } catch (err) {
        console.error(err.message);
        res.json({ success: false, message: err.message });
    }
}

//get unseen messages count for sidebar
export const getUnseenMessagesCount = async (req, res) => {
    try {
        const userId = req.user._id; //myid
        const filteredUsers = await Users.find({ _id: { $ne: userId } }).select("-password -bio -profilePic -createdAt -updatedAt -__v");

        //count unseen messages for each user
        const usersWithUnseenCount = await Promise.all(filteredUsers.map(async (user) => {
            const unseenCount = await Message.countDocuments({ senderId: user._id, receiverId: userId, seen: false });
            return { ...user.toObject(), unseenCount };
        }));

        const mappedData = {};
        usersWithUnseenCount.forEach((data) => {
            mappedData[data._id] = data.unseenCount; 
        });
        res.json({ success: true, unSeenCountMap: mappedData });

    } catch (err) {
        console.error(err.message);
        res.json({ success: false, message: err.message });
    }
}

//get all messages for selectd user
export const getAllMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: selectedId } = req.params;
        const messages = await Message.find({ $or: [{ senderId: selectedId, receiverId: myId }, { senderId: myId, receiverId: selectedId }] }).sort({ createdAt: 1 });
        await Message.updateMany({ senderId: selectedId, receiverId: myId }, { seen: true });
        res.json({ success: true, messages: messages })
    } catch (err) {
        console.error(err.message);
        res.json({ success: false, message: err.message });
    }
}


//api to mark messages as seen by id
export const markMessagesAsSeen = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: selectedId } = req.params;

        await Message.findByIdAndUpdate(id, { seen: true });
        await res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.json({ success: false, message: err.message });
    }
}

//send message to a user
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
            mediaUrl: imgUrl
        });

        const receiverSocketId = userSocketMap[selectedId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("new-message", message);
        }

        res.json({ success: true, message: "Message sent successfully" });

    } catch (err) {
        console.error(err.message);
        res.json({ success: false, message: err.message });
    }

}

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

            // Lookup sender info
            {
                $lookup: {
                    from: "users", // the collection name in MongoDB
                    localField: "senderId",
                    foreignField: "_id",
                    as: "senderInfo"
                }
            },
            { $unwind: "$senderInfo" },

            // Lookup receiver info
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiverInfo"
                }
            },
            { $unwind: "$receiverInfo" },

            // Project only the fields you need
            {
                $project: {
                    _id: 1,
                    senderId: 1,
                    receiverId: 1,
                    messageText: 1,
                    mediaUrl: 1,
                    createdAt: 1,
                    // senderUserName: "$senderInfo.userName",
                    // senderProfilePic: "$senderInfo.profilePic",
                    userName: "$receiverInfo.userName",
                    profilePic: "$receiverInfo.profilePic",
                }
            }
        ]);

        res.json({ success: true, recentChats: recentMessages });

    } catch (err) {
        console.error(err.message);
        res.json({ success: false, message: err.message });
    }
}
