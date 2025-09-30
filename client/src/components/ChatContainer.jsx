import { Dot, Image, InfoIcon, Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";

const ChatContainer = ({ selectedUser, currentUserId }) => {
    const [conversation, setConversation] = useState([]);
    currentUserId = '680f50aaf10f3cd28382ecf2'

    const getConversations = () => {
        if (!selectedUser) return [];
        return messagesDummyData.filter(
            (msg) =>
                msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id
        );
    };

    useEffect(() => {
        if (selectedUser) {
            let data = getConversations();
            setConversation(data);
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
                    <p>{selectedUser?.fullName || "Unknown"}</p>
                </span>
                <InfoIcon />
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col-reverse overflow-y-auto gap-3 p-3">
                {conversation.map((message) => {
                    const isMe = message.senderId === currentUserId;
                    return (
                        <div
                            key={message._id}
                            className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            {/* Avatar (left for them, right for me) */}
                            {!isMe && (
                                <img
                                    src={selectedUser?.profilePic || assets.avatar_icon}
                                    alt="sender avatar"
                                    className="w-7 h-7 rounded-full"
                                />
                            )}

                            {/* Message bubble */}
                            <div
                                className={`px-3 py-2 rounded-lg max-w-xs ${isMe ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                                    }`}
                            >
                                {message.text || (
                                    <img
                                        src={message.image}
                                        alt="sent"
                                        className="max-w-[200px] rounded-md"
                                    />
                                )}
                                <p className="text-[10px] text-gray-300 mt-1 text-right">
                                    {new Date(message.createdAt).toLocaleTimeString([], {
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
                    />
                    <Image className="text-gray-400 cursor-pointer hover:text-white" />
                </span>
                <Send className="text-blue-500 cursor-pointer hover:text-blue-400" />
            </div>
        </div>
    );
};

export default ChatContainer;
