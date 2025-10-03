import { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { Realtime } from 'ably';

export const ChatContext = createContext();

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [ablyClient, setAblyClient] = useState(null);
    const [ablyChannel, setAblyChannel] = useState(null);

    const { axios, authUser } = useContext(AuthContext);

    // Initialize Ably
    useEffect(() => {
        if (!authUser) return;

        const client = new Realtime({
            authUrl: `${BASE_URL}/api/ably/auth?userId=${authUser._id}`, // endpoint to generate Ably token
        });

        const channel = client.channels.get(`user:${authUser._id}`);
        setAblyClient(client);
        setAblyChannel(channel);

        // Subscribe to real-time events
        const handler = (msg) => {
            const { type, payload } = msg.data;

            if (type === "newMessage") {
                setMessages(prev => [...prev, payload]);
            }
            if (type === "messagesSeen") {
                // update seen status of messages
                setMessages(prev => prev.map(m =>
                    m.senderId === payload.receiverId && m.receiverId === payload.senderId
                        ? { ...m, seen: true }
                        : m
                ));
            }
        };

        channel.subscribe(handler);

        return () => {
            channel.unsubscribe(handler);
            client.close();
        };
    }, [authUser]);

    // Fetch recent chats
    const getRecentChats = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/recent-chats/${userId}`);
            if (data.success) return data.recentChats;
        } catch (err) {
            console.error(err.message);
        }
    };

    // Fetch unseen messages count
    const getUnseenMessagesCount = async () => {
        try {
            const { data } = await axios.get('/api/messages/unseen-count');
            if (data.success) return data.unSeenCountMap;
        } catch (err) {
            console.error(err.message);
        }
    };

    // Fetch all messages with a specific user
    const getAllMessages = async (selectedId) => {
        try {
            const { data } = await axios.get('/api/messages/all-messages/' + selectedId);
            if (data.success) return data.messages;
        } catch (err) {
            console.error(err.message);
        }
    };

    // Send a new message via API + Ably
    const sendMessage = async (receiverId, messageText, mediaUrl = null) => {
        try {
            const { data } = await axios.post('/api/messages/send', {
                receiverId,
                messageText,
                mediaUrl
            });

            if (data.success && ablyChannel) {
                // publish to Ably channel of the receiver
                const message = data.message;
                const receiverChannel = ablyClient.channels.get(`user:${receiverId}`);
                receiverChannel.publish('message', { type: 'newMessage', payload: message });
                // also update local messages
                setMessages(prev => [...prev, message]);
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    const values = {
        messages,
        users,
        selectedChatUser,
        setSelectedChatUser,
        getRecentChats,
        getUnseenMessagesCount,
        getAllMessages,
        sendMessage
    };

    return <ChatContext.Provider value={values}>
        {children}
    </ChatContext.Provider>;
};
