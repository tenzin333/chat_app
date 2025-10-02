import { CheckCheck, Image, InfoIcon, Send } from "lucide-react";
import React, { useContext, useEffect, useState, useRef } from "react";
import assets  from "/assets/assets";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const ChatContainer = ({ selectedUser, setShowProfile }) => {
    const [userMessages, setUserMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const { authUser, socket } = useContext(AuthContext);
    const { getAllMessages } = useContext(ChatContext);
    const [currentUserId, setCurrentUserId] = useState(authUser._id);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Helper function to format date labels
    const formatDateLabel = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time to midnight for comparison
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        messageDate.setHours(0, 0, 0, 0);

        if (messageDate.getTime() === today.getTime()) {
            return "Today";
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return "Yesterday";
        } else {
            return messageDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };


    // Helper function to check if date changed between messages
    const shouldShowDateSeparator = (currentMessage, previousMessage) => {
        if (!previousMessage) return true;

        const currentDate = new Date(currentMessage.createdAt);
        const previousDate = new Date(previousMessage.createdAt);

        return currentDate.toDateString() !== previousDate.toDateString();
    };


    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (e.g., 4MB limit)
        if (file.size > 4 * 1024 * 1024) {
            toast.error('Image size should be less than 4MB');
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        }
        reader.readAsDataURL(file);

    }

    const handleSendImage = () => {
        fileInputRef.current.click(); //trigger file input click
    }

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
        if (!currentMessage.trim() && !selectedImage) return;

        try {
            let mediaUrl = null;

            if (selectedImage) {
                const reader = new FileReader();
                reader.readAsDataURL(selectedImage);

                mediaUrl = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                });
            }

            const { data } = await axios.post(
                "/api/messages/send-message/" + selectedUser._id,
                {
                    messageText: currentMessage,
                    mediaUrl: mediaUrl
                }
            );

            if (data.success) {
                setCurrentMessage("");
                setSelectedImage(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                toast.error(data.message);
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

    // Mark messages as seen when opening chat
    const markMessagesAsSeen = async () => {
        try {
            await axios.put(`/api/messages/mark-seen/${selectedUser._id}`);
        } catch (err) {
            console.error("Error marking messages as seen:", err);
        }
    };



    // Subscribe to real-time messages
    useEffect(() => {
        if (!socket || !selectedUser) return;

        // Handler for new messages
        const handleNewMessage = (newMessage) => {
            // Only add message if it's from/to the current chat
            if (
                (newMessage.senderId === selectedUser._id && newMessage.receiverId === currentUserId) ||
                (newMessage.senderId === currentUserId && newMessage.receiverId === selectedUser._id)
            ) {
                setUserMessages((prev) => [...prev, newMessage]);

                // If message is from the other user, mark it as seen
                if (newMessage.senderId === selectedUser._id) {
                    markMessagesAsSeen();
                }
            }
        };

        // Handler for message seen updates
        const handleMessageSeen = (data) => {
            // data should contain: { senderId, receiverId, messageIds }
            // Update all messages from me to selectedUser as seen
            if (data.receiverId === currentUserId && data.senderId === selectedUser._id) {
                setUserMessages((prev) =>
                    prev.map((msg) =>
                        msg.senderId === currentUserId && msg.receiverId === selectedUser._id
                            ? { ...msg, seen: true }
                            : msg
                    )
                );
            }
        };

        // Listen to socket events
        socket.on("newMessage", handleNewMessage);
        socket.on("messagesSeen", handleMessageSeen);

        // Cleanup listeners on unmount or when selectedUser changes
        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesSeen", handleMessageSeen);
        };
    }, [socket, selectedUser, currentUserId]);

    // Load messages and mark as seen when user is selected
    useEffect(() => {
        if (selectedUser) {
            getUserMessages();
            markMessagesAsSeen();
        }
    }, [selectedUser]);

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