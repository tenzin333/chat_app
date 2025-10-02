import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setonlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check-auth');
            if (data.success) {
                setAuthUser(data.user);
            }
        } catch (err) {
            toast.error(err.message);
        }
    }

    //login function 
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err);
        }
    }

    //logout function
    const logout = () => {
        setAuthUser(null);
        setToken(null);
        localStorage.removeItem('token');
        axios.defaults.headers.common['Authorization'] = null;
        toast.success("Logged out successfully");
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }

    //update user profiles
    const updateProfile = async (updatedData) => {
        try {
            const { data } = await axios.put('/api/auth/update-profile', updatedData);
            if (data.success) {
                setAuthUser(data.user);
                toast.success(data.message);
            }
        } catch (err) {
            console.error(err.message);
            toast.error(err.message);
        }
    }

    //fetch all users 
    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/auth/all-users');
            if (data.success)
                return data.users;
        } catch (err) {
            console.error(err.message);
            toast.error(err.message);
        }
    }

    // Socket connection effect - runs when authUser changes
    useEffect(() => {
        if (authUser && !socket) { 
            const newSocket = io(backendUrl, {
                query: {
                    userId: authUser._id
                },
                transports: ['websocket'],
                reconnection: true
            });

            newSocket.on('online-users', (userIds) => {
                setonlineUsers(userIds);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else if (!authUser && socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [authUser]);

    // Check auth on mount
    useEffect(() => {
        if (!token) {
            return;
        }
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        checkAuth();
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        fetchUsers
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}