import { Badge, EllipsisVertical, Search } from "lucide-react";
import React, { useContext, useEffect, useState, useCallback } from "react";
import assets from '../assets/assets';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [recentChats, setRecentChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [unSeenCount, setUnSeenCount] = useState({});
  const [searchText, setSearchText] = useState("");

  const { logout, authUser } = useContext(AuthContext);
  const { getRecentChats, getUnseenMessagesCount } = useContext(ChatContext);
  const navigate = useNavigate();
  const status = "active"; // replace with real status if available

  // Fetch recent chats
  const fetchRecentChats = useCallback(async () => {
    try {
      const data = await getRecentChats(authUser._id);
      setRecentChats(data || []);
    } catch (err) {
      console.error(err.message);
    }
  }, [authUser, getRecentChats]);

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

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query) {
        setSearchResults([]);
        return;
      }
      try {
        const result = await searchUser(query);
        if (result.success) setSearchResults(result.users);
      } catch (err) {
        console.error(err);
      }
    }, 500),
    []
  );

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

  // Determine which users to display
  const displayUsers = searchText ? searchResults : recentChats;
  console.log("ddd",displayUsers)

  return (
    <div className='border border-r rounded-2xl border-gray-600'>
      <div className='flex flex-col p-2 gap-3'>
        {/* Header */}
        <div className='flex flex-row justify-between items-center'>
          <img src='/src/assets/logo.png' alt="logo" width="200px" height="200px" />
          <div className='relative' onMouseEnter={() => setShowMore(true)}>
            <EllipsisVertical className='hover' />
            {showMore && (
              <div
                className='flex flex-col text-xs py-1 absolute right-3 top-7 border rounded-md bg-gray-700 min-w-[80px] z-20'
                onMouseEnter={() => setShowMore(true)}
                onMouseLeave={() => setShowMore(false)}
              >
                <p
                  className='cursor-pointer px-3 py-2 hover:bg-gray-600 text-left'
                  onClick={() => navigate('/profile')}
                >
                  Edit
                </p>
                <hr className="w-full border-t border-gray-300 my-1" />
                <p
                  className='cursor-pointer px-3 py-2 hover:bg-gray-600 text-left'
                  onClick={handleLogout}
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex border rounded-full items-center px-2 gap-1 mt-3">
          <Search width="20px" height="20px" />
          <input
            className="text-white text-sm bg-transparent border-none outline-none w-[100%] p-2 flex-1"
            type="text"
            placeholder="Search.."
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>

        {/* Users List */}
        <div className="flex flex-col justify-center gap-3 mt-4 overflow-auto max-h-[400px]">
          {displayUsers.map((user) => (
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
              <p className='absolute right-2 top-5 text-sm border rounded-full h-6 w-6 flex justify-center items-center backdrop-blur'>
                {unSeenCount?.[user._id] || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
