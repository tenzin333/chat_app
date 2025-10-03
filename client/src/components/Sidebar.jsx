import { Badge, EllipsisVertical, Search } from "lucide-react";
import React, { useContext, useEffect, useState, useCallback } from "react";
import assets from '@assets/assets';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Realtime } from "ably";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [recentChats, setRecentChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [unSeenCount, setUnSeenCount] = useState({});
  const [searchText, setSearchText] = useState("");
  const [ablyClient, setAblyClient] = useState(null);
  const [ablyChannel, setAblyChannel] = useState(null);

  const { logout, authUser } = useContext(AuthContext);
  const { getRecentChats, getUnseenMessagesCount } = useContext(ChatContext);
  const navigate = useNavigate();
  const status = "active";

  // Initialize Ably
  useEffect(() => {
    if (!authUser) return;

    const client = new Realtime({
      authUrl: `${BASE_URL}/api/ably/auth?userId=${authUser._id}`, // backend endpoint to provide Ably token
    });

    const channel = client.channels.get(`user:${authUser._id}`);
    setAblyClient(client);
    setAblyChannel(channel);

    return () => {
      channel.unsubscribe();
      client.close();
    };
  }, [authUser]);

  // Helper to convert IDs to strings
  const idToString = (id) => (id ? (typeof id === 'object' ? id.toString() : String(id)) : null);

  // Update chat list when new message arrives
  const updateChatOrder = useCallback((message) => {
    const { senderId, receiverId, messageText, createdAt, seen } = message;
    const currentUserId = idToString(authUser._id);
    const msgSenderId = idToString(senderId);
    const msgReceiverId = idToString(receiverId);
    const otherUserId = msgSenderId === currentUserId ? msgReceiverId : msgSenderId;

    setRecentChats((prevChats) => {
      const existingChatIndex = prevChats.findIndex(chat => idToString(chat._id) === otherUserId);
      const updatedChats = [...prevChats];

      if (existingChatIndex !== -1) {
        const existingChat = { ...updatedChats[existingChatIndex] };
        existingChat.lastMessage = messageText;
        existingChat.lastMessageTime = createdAt;
        updatedChats.splice(existingChatIndex, 1);
        updatedChats.unshift(existingChat);
      } else {
        fetchRecentChats();
        return prevChats;
      }

      return updatedChats;
    });

    if (msgSenderId !== currentUserId && !seen) {
      setUnSeenCount(prev => ({ ...prev, [msgSenderId]: (prev[msgSenderId] || 0) + 1 }));
    }
  }, [authUser._id]);

  // Handle OTHER USER reads MY messages
  const handleMessagesSeen = useCallback((data) => {
    const { senderId, receiverId } = data;
    const currentUserId = idToString(authUser._id);

    if (idToString(senderId) === currentUserId) {
      setUnSeenCount(prev => ({ ...prev, [idToString(receiverId)]: 0 }));
    }
  }, [authUser._id]);

  // Handle I read SOMEONE ELSE'S messages
  const handleMessagesSeenByMe = useCallback((data) => {
    const { receiverId } = data;
    setUnSeenCount(prev => ({ ...prev, [idToString(receiverId)]: 0 }));
  }, []);

  // Subscribe to Ably events
  useEffect(() => {
    if (!ablyChannel) return;

    const handler = (msg) => {
      const { type, payload } = msg.data;

      if (type === "newMessage") updateChatOrder(payload);
      if (type === "messagesSeen") handleMessagesSeen(payload);
      if (type === "messagesSeenByMe") handleMessagesSeenByMe(payload);
    };

    ablyChannel.subscribe(handler);
    return () => ablyChannel.unsubscribe(handler);
  }, [ablyChannel, updateChatOrder, handleMessagesSeen, handleMessagesSeenByMe]);

  // Fetch recent chats
  const fetchRecentChats = useCallback(async () => {
    try {
      const data = await getRecentChats(authUser._id);
      setRecentChats(data || []);
    } catch (err) {
      console.error(err.message);
    }
  }, [authUser._id, getRecentChats]);

  // Fetch unseen messages count
  const fetchUnseenCount = useCallback(async () => {
    try {
      const data = await getUnseenMessagesCount();
      setUnSeenCount(data || {});
    } catch (err) {
      console.error(err.message);
    }
  }, [getUnseenMessagesCount]);

  // API call to search users
  const searchUser = async (query) => {
    try {
      const { data } = await axios.get("/api/auth/searchUser/" + query.trim());
      return data;
    } catch (err) {
      console.error(err.message);
      return { success: false, users: [] };
    }
  };

  // Debounce helper
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query) { setSearchResults([]); return; }
      try {
        const result = await searchUser(query);
        if (result.success) setSearchResults(result.users);
      } catch (err) { console.error(err); }
    }, 500),
    []
  );

  // Mark messages as seen when selecting a user
  useEffect(() => {
    const updateSeenMessages = async (id) => {
      try {
        await axios.put("/api/messages/mark-seen/" + id);
        setUnSeenCount(prev => ({ ...prev, [id]: 0 }));
      } catch (err) {
        toast.error(err.message);
      }
    };

    if (selectedUser && selectedUser._id) updateSeenMessages(selectedUser._id);
  }, [selectedUser]);

  // Initial fetch
  useEffect(() => {
    fetchRecentChats();
    fetchUnseenCount();
  }, [fetchRecentChats, fetchUnseenCount]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleLogout = () => logout();
  const displayUsers = searchText ? searchResults : recentChats;

  return (
    <div className='border border-r rounded-2xl border-gray-600'>
      <div className='flex flex-col p-2 gap-3'>
        {/* Header */}
        <div className='flex flex-row justify-between items-center'>
          <img src={assets.logo} alt="logo" width="200px" height="200px" />
          <div className='relative' onMouseEnter={() => setShowMore(true)}>
            <EllipsisVertical className='hover' />
            {showMore && (
              <div
                className='flex flex-col text-xs py-1 absolute right-3 top-7 border rounded-md bg-gray-700 min-w-[80px] z-20'
                onMouseEnter={() => setShowMore(true)}
                onMouseLeave={() => setShowMore(false)}
              >
                <p className='cursor-pointer px-2 py-2 hover:bg-gray-600 text-left' onClick={() => navigate('/profile')}>Edit profile</p>
                <hr className="w-full border-t border-gray-300 my-1" />
                <p className='cursor-pointer px-3 py-2 hover:bg-gray-600 text-left' onClick={handleLogout}>Logout</p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex border rounded-full items-center px-2 gap-1 my-3">
          <Search width="20px" height="20px" />
          <input
            className="text-white text-sm bg-transparent border-none outline-none w-[100%] p-2 flex-1"
            type="text"
            placeholder="Search.."
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>

        <hr />
        <p className='text-1xs'>Recent chats</p>

        {/* Users List */}
        <div className="flex flex-col justify-center gap-3 mt-4 overflow-auto max-h-[400px]">
          {displayUsers.length==0 && 
            <p >No recent chats</p>
           }
          {displayUsers.map(user => (
            <div
              key={user._id}
              className={`flex flex-row text-white py-1 gap-3 border-b-0.5 rounded-md border-gray-600 cursor-pointer relative hover:bg-gray-700
                ${selectedUser?._id === user._id ? 'bg-gray-600' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                alt="pic"
                width="50"
                height="50"
                className="rounded-full"
              />
              <div className='flex flex-col gap-1'>
                <p>{user.userName}</p>
                <p className={`text-sm ${status === "active" ? 'text-green-200' : 'text-gray-200'}`}>
                  {status === 'active' ? 'Online' : 'Offline'}
                </p>
              </div>
              {unSeenCount?.[user._id] > 0 && (
                <p className='absolute right-2 top-5 text-sm bg-blue-500 text-white rounded-full h-6 w-6 flex justify-center items-center'>
                  {unSeenCount[user._id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
