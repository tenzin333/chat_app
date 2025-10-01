import { Image, InfoIcon, Send } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const ChatContainer = ({ selectedUser }) => {
    const [userMessages, setUserMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const { authUser } = useContext(AuthContext);
    const { getAllMessages } = useContext(ChatContext);
    const currentUserId = authUser._id;

    const getUserMessages = async () => {
        try {
            const data = await getAllMessages(selectedUser._id);
            setUserMessages(data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        
        // Don't send empty messages
        if (!currentMessage.trim()) return;

        try {
            const { data } = await axios.post(
                "/api/messages/send-message/" + selectedUser._id,
                {
                    messageText: currentMessage,
                    // mediaUrl: mediaUrl
                }
            );
            
            if (data.success) {
                setCurrentMessage("");
                // Refresh messages after sending
                await getUserMessages();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (selectedUser) {
            getUserMessages();
        }
    }, [selectedUser]);

    if (!selectedUser) {
        return (
            <div className="flex flex-col justify-center items-center gap-4 backdrop-blur-lg h-full border-r rounded-2xl">
                <img
                    src={"/src/assets/logo_icon.svg"}
                    className="max-w-[60px] max-h-[60px]"
                />
                <p className="text-lg text-white">Chat anytime, anywhere</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-scroll flex flex-col border-r border-gray-700 rounded-2xl">
            {/* Header */}
            <div className="flex flex-row justify-between items-center py-2 border-b border-gray-700 px-2">
                <span className="flex flex-row gap-2 items-center">
                    <div className="relative">
                        <img
                            src={selectedUser?.profilePic || "/src/assets/avatar_icon.png"}
                            alt="profile pic"
                            width="50"
                            height="50"
                            className="border rounded-full"
                        />
                        {/* online dot */}
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-gray-900" />
                    </div>
                    <p>{selectedUser?.userName || "Unknown"}</p>
                </span>
                <InfoIcon />
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col-reverse overflow-y-auto gap-3 p-3">
                {userMessages &&
                    userMessages.map((message) => {
                        const isMe = message.senderId === currentUserId;
                        return (
                            <div
                                key={message._id}
                                className={`flex items-end gap-2 ${
                                    isMe ? "justify-end" : "justify-start"
                                }`}
                            >
                                {/* Avatar (left for them, right for me) */}
                                {!isMe && (
                                    <img
                                        src={
                                            selectedUser?.profilePic ||
                                            assets.avatar_icon
                                        }
                                        alt="sender avatar"
                                        className="w-7 h-7 rounded-full"
                                    />
                                )}

                                {/* Message bubble */}
                                <div
                                    className={`px-2 py-1 rounded-lg max-w-xs ${
                                        isMe
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-700 text-white"
                                    }`}
                                >
                                    {message.messageText || (
                                        <img
                                            src={message.image}
                                            alt="sent"
                                            className="max-w-[200px] rounded-md"
                                        />
                                    )}
                                    <p className="text-[10px] text-gray-300  text-right">
                                        {new Date(
                                            message.createdAt
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                {/* My avatar (on the right) */}
                                {isMe && (
                                    <img
                                        src={assets.avatar_icon}
                                        alt="my avatar"
                                        className="w-7 h-7 rounded-full"
                                    />
                                )}
                            </div>
                        );
                    })}
            </div>

            {/* Input bar */}
            <div className="flex flex-row items-center gap-3 p-2 border-t border-gray-700">
                <span className="flex flex-row items-center gap-2 border rounded-2xl px-3 py-2 flex-1 bg-gray-700">
                    <input
                        type="text"
                        className="border-none outline-none w-full bg-transparent text-white"
                        placeholder="Say something..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <Image className="text-gray-400 cursor-pointer hover:text-white" />
                </span>
                <Send
                    className="text-blue-500 cursor-pointer hover:text-blue-400"
                    onClick={sendMessage}
                />
            </div>
        </div>
    );
};

export default ChatContainer;