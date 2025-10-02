import react, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";

const HomePage = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfile,setShowProfile] = useState(false);
    return (
        <div className="flex  items-center justify-center  min-h-screen ">
            <div className={`grid grid-cols-1 overflow-hidden backdrop-blur-2xl border-2 border-gray-600 rounded-2xl shadow-xl min-w-[90%] h-[550px] gap-2 backdrop-sepia-0 
                ${showProfile ? 'md:grid-cols-[0.7fr_1.5fr_0.7fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-[0.7fr_1.5fr]'} `}>
                <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
                <ChatContainer selectedUser={selectedUser} setShowProfile={setShowProfile} />
                {showProfile && <RightSidebar selectedUser={selectedUser} showProfile={false} setShowProfile={setShowProfile}/>}
            </div>
        </div>
    )
}
export default HomePage;