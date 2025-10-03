import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Realtime } from 'ably';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [ablyClient, setAblyClient] = useState(null);

    // --- Auth functions ---
    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check-auth');
            if (data.success) setAuthUser(data.user);
        } catch (err) {
            toast.error(err.message);
        }
    }

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setToken(data.token);
                localStorage.setItem('token', data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message || err);
        }
    }

    const logout = () => {
        setAuthUser(null);
        setToken(null);
        localStorage.removeItem('token');
        axios.defaults.headers.common['Authorization'] = null;
        toast.success("Logged out successfully");
        if (ablyClient) {
            ablyClient.close();
            setAblyClient(null);
        }
        setOnlineUsers([]);
        setMessages([]);
    }

    const updateProfile = async (updatedData) => {
        try {
            const { data } = await axios.put('/api/auth/update-profile', updatedData);
            if (data.success) {
                setAuthUser(data.user);
                toast.success(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    }

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/auth/all-users');
            if (data.success) return data.users;
        } catch (err) {
            toast.error(err.message);
        }
    }

    // --- Ably setup ---
    useEffect(() => {
        if (authUser && !ablyClient) {
            const client = new Realtime({ authUrl: `${backendUrl}/api/ably/auth?userId=${authUser._id}` });
            const channel = client.channels.get('chat-room');

            // Subscribe to messages
            channel.subscribe('message', (msg) => {
                setMessages(prev => [...prev, msg.data]);
            });

            // Presence tracking
            channel.presence.enter();
            channel.presence.subscribe('enter', (member) => {
                setOnlineUsers(prev => [...prev, member.clientId]);
            });
            channel.presence.subscribe('leave', (member) => {
                setOnlineUsers(prev => prev.filter(id => id !== member.clientId));
            });

            setAblyClient(client);

            return () => {
                channel.presence.leave();
                client.close();
                setAblyClient(null);
            }
        }
    }, [authUser]);

    // Check auth on mount
    useEffect(() => {
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        checkAuth();
    }, []);

    // Send a chat message
    const sendMessage = (text) => {
        if (!authUser || !ablyClient) return;
        const channel = ablyClient.channels.get('chat-room');
        channel.publish('message', { from: authUser._id, text });
    }

    const value = {
        axios,
        authUser,
        onlineUsers,
        messages,
        login,
        logout,
        updateProfile,
        fetchUsers,
        sendMessage
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
