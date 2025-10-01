import { createContext, useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const { axios, socket } = useContext(AuthContext);

    const getRecentChats = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/recent-chats/${userId}`);
            if (data.success) {
                return data.recentChats;
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const getUnseenMessagesCount = async () => {
        try {
            const { data } = await axios.get('/api/messages/unseen-count');
            if (data.success) {
                return data.unSeenCountMap;
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const getAllMessages = async (selectedId) => {
        try {
            const { data } = await axios.get('/api/messages/all-messages/'+selectedId);
            if (data.success) {
                return data.messages;
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const values = {
        messages,
        users,
        getRecentChats,
        getUnseenMessagesCount,
        getAllMessages
    }

    return <ChatContext.Provider value={values}>
        {children}
    </ChatContext.Provider>
}

