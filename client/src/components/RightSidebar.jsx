import react, { useState, useEffect } from 'react';
import assets from "/assets/assets"; // Add this import
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const RightSidebar = ({ selectedUser,showProfile,setShowProfile }) => {
    const [media, setMedia] = useState([]);
    
    useEffect(() => {
        const fetchMedia = async() => {
            try{
                    const {data} = await axios.get("/api/messages/get-shared-media/"+selectedUser._id);
                    setMedia(data.media);
            }catch(err){
                toast.error(err);
            }
        }
        fetchMedia();
    },[selectedUser])


    return (
        <div className='flex flex-col pt-5 w-full'>
            <div className='flex flex-col justify-center items-center gap-2 mb-4 relative'>
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-30 rounded-full" />
                <p>{selectedUser.userName}</p>
                <p className='text-sm text-gray-400'>{selectedUser.bio}</p>
            </div>
            <div className='absolute top-2 right-3'><X size={"20px"} onClick={()=>setShowProfile(false)} /></div>
            <hr className="w-full border-t border-gray-300" />
            
            {/*Shared Media*/}
            <div className='flex flex-col items-center w-full gap-3 mt-4'>
                <p className='font-bold'>Media</p>

                <div className='flex flex-wrap gap-3 justify-center'>
                    {media && media.length > 0 ?
                        media.map((msg, index) => {
                            return (
                                <div key={index} className='border-2 rounded'>
                                    <img 
                                        src={msg.mediaUrl} 
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