import react, { useState, useEffect } from 'react';
import { messagesDummyData } from "../assets/assets";
import assets from "../assets/assets"; // Add this import

const RightSidebar = ({ selectedUser }) => {
    const [media, setMedia] = useState([]);

    const fetchConversations = () => {
        if(!selectedUser)
            return [];
        
        // Fix the filtering logic
        const mediaMessages = messagesDummyData.filter((msg) => {
            return msg.image && msg.senderId === selectedUser._id;
        });
        
        // Return only the image URLs
        return mediaMessages.map(msg => msg.image);
    }

    useEffect(() => {
        setMedia(fetchConversations());
    }, [selectedUser]) // Add dependency

     
    if (!selectedUser) {
        return "";
    }

    return (
        <div className='flex flex-col pt-5 w-full'>
            <div className='flex flex-col justify-center items-center gap-2 mb-4'>
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-30 rounded-full" />
                <p>{selectedUser.userName}</p>
                <p className='text-sm text-gray-400'>{selectedUser.bio}</p>
            </div>
            <hr className="w-full border-t border-gray-300" />
            
            {/*Shared Media*/}
            <div className='flex flex-col items-center w-full gap-3 mt-4'>
                <p className='font-bold'>Media</p>

                <div className='flex flex-wrap gap-3 justify-center'>
                    {media && media.length > 0 ?
                        media.map((imageUrl, index) => {
                            return (
                                <div key={index} className='border-2 rounded'>
                                    <img 
                                        src={imageUrl} 
                                        alt={`Shared media ${index + 1}`}
                                        className='w-16 h-16 object-cover rounded' 
                                    />
                                </div>
                            )
                        })
                        : <div className='text-gray-500 text-sm'>
                            No media shared
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default RightSidebar;