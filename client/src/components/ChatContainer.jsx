import { CheckCheck, Image, InfoIcon, Send } from "lucide-react";
import React, { useContext, useEffect, useState, useRef } from "react";
import assets from "@assets/assets";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Realtime } from "ably";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ChatContainer = ({ selectedUser, setShowProfile }) => {
    const [userMessages, setUserMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [ablyClient, setAblyClient] = useState(null);
    const [messagesChannel, setMessagesChannel] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const { authUser } = useContext(AuthContext);
    const { getAllMessages } = useContext(ChatContext);

    // Set current user
    useEffect(() => {
        if (authUser) setCurrentUserId(authUser._id);
    }, [authUser]);

    // Initialize Ably Realtime
    useEffect(() => {
        if (!authUser) return;

        const initAbly = async () => {
            const client = new Realtime({
                authUrl: `${BASE_URL}/api/ably/auth?userId=${authUser._id}`,
            });
            const channel = client.channels.get("chat-room");

            // Subscribe to messages
            channel.subscribe("message", (msg) => {
                const data = msg.data;
                if (
                    (data.from === selectedUser?._id && data.to === currentUserId) ||
                    (data.from === currentUserId && data.to === selectedUser?._id)
                ) {
                    setUserMessages((prev) => [...prev, data]);
                }
            });

            // Presence tracking
            channel.presence.enter();
            channel.presence.subscribe("enter", (member) => {
                setOnlineUsers((prev) => [...prev, member.clientId]);
            });
            channel.presence.subscribe("leave", (member) => {
                setOnlineUsers((prev) =>
                    prev.filter((id) => id !== member.clientId)
                );
            });

            setAblyClient(client);
            setMessagesChannel(channel);

            return () => {
                channel.presence.leave();
                client.close();
            };
        };

        initAbly();
    }, [authUser, selectedUser, currentUserId]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch messages from backend
    const getUserMessages = async () => {
        if (!selectedUser) return;
        try {
            const data = await getAllMessages(selectedUser._id);
            setUserMessages(data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        if (selectedUser) getUserMessages();
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [userMessages]);

    // Send message
    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!currentMessage.trim() && !selectedImage) return;

        let mediaUrl = null;

        if (selectedImage) {
            const reader = new FileReader();
            reader.readAsDataURL(selectedImage);
            mediaUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
            });
        }

        const messageData = {
            from: currentUserId,
            to: selectedUser._id,
            messageText: currentMessage,
            mediaUrl,
            createdAt: new Date().toISOString(),
            seen: false,
        };

        try {
            if (messagesChannel) {
                messagesChannel.publish("message", messageData);
            }

            // Persist message in backend
            await axios.post(
                `/api/messages/send-message/${selectedUser._id}`,
                messageData
            );

            setCurrentMessage("");
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
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

    // Image handling
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return toast.error("Select image file");
        if (file.size > 4 * 1024 * 1024) return toast.error("Image < 4MB");

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSendImage = () => fileInputRef.current.click();
    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Date formatting
    const formatDateLabel = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        messageDate.setHours(0, 0, 0, 0);

        if (messageDate.getTime() === today.getTime()) return "Today";
        if (messageDate.getTime() === yesterday.getTime()) return "Yesterday";
        return messageDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const shouldShowDateSeparator = (current, previous) => {
        if (!previous) return true;
        return new Date(current.createdAt).toDateString() !==
            new Date(previous.createdAt).toDateString();
    };

    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [userMessages]);

    if (!selectedUser) {
        return (
            <div className="flex flex-col justify-center items-center gap-4 backdrop-blur-lg h-full border-r rounded-2xl">
                <img
                    src={assets.logo_icon}
                    className="max-w-[60px] max-h-[60px]"
                />
                <p className="text-lg text-white">Chat anytime, anywhere</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-hidden flex flex-col border-r border-gray-700 rounded-2xl">
            {/* Header */}
            <div className="flex flex-row justify-between items-center py-2 border-b border-gray-700 px-2">
                <span className="flex flex-row gap-2 items-center">
                    <div className="relative">
                        <img
                            src={selectedUser?.profilePic || assets.avatar_icon}
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
                <InfoIcon onClick={() => setShowProfile((prevData) => !prevData)} />
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto gap-3 p-3 flex flex-col">
                {userMessages &&
                    userMessages.map((message, index) => {
                        const isMe = message.senderId === currentUserId;
                        const previousMessage = index > 0 ? userMessages[index - 1] : null;
                        const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

                        return (
                            <React.Fragment key={message._id}>
                                {/* Date Separator */}
                                {showDateSeparator && (
                                    <div className="flex justify-center my-2">
                                        <span className="bg-[#202c33] text-gray-300 text-xs px-3 py-1 rounded-md shadow-sm">
                                            {formatDateLabel(message.createdAt)}
                                        </span>
                                    </div>
                                )}

                                {/* Message */}
                                <div
                                    className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {/* Message bubble - WhatsApp Style */}
                                    <div
                                        className={`relative max-w-[65%] px-3 py-2 rounded-lg shadow-md ${isMe
                                            ? "bg-[#005c4b] text-white rounded-br-none"
                                            : "bg-[#202c33] text-white rounded-bl-none"
                                            }`}
                                    >
                                        {message.messageText ? (
                                            <p className="text-sm leading-relaxed break-words pr-16">
                                                {message.messageText}
                                            </p>
                                        ) : (
                                            <img
                                                src={message.mediaUrl}
                                                alt="sent"
                                                className="max-w-[200px] rounded-md mb-1"
                                            />
                                        )}

                                        {/* Time and checkmarks - absolute positioned */}
                                        <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                            <span className="text-[10px] text-gray-300">
                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            {isMe && (
                                                <CheckCheck
                                                    size={14}
                                                    className={
                                                        message.seen
                                                            ? "text-[#53bdeb]"
                                                            : "text-gray-400"
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                <div ref={messagesEndRef} />
            </div>

            {/* Image preview */}
            {imagePreview && (
                <div className="px-4 py-2 border-t border-gray-700 bg-gray-800">
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="preview"
                            className="max-h-32 rounded-lg"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Input bar */}
            <div className="flex flex-row items-center gap-3 p-2 border-t border-gray-700">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                />
                <span className="flex flex-row items-center gap-2 border rounded-2xl px-3 py-2 flex-1 bg-gray-700">
                    <input
                        type="text"
                        className="border-none outline-none w-full bg-transparent text-white"
                        placeholder="Say something..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <Image className="text-gray-400 cursor-pointer hover:text-white" onClick={handleSendImage} />
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