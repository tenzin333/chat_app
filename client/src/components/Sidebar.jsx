import { Badge, EllipsisVertical, MessageCircle, Search } from "lucide-react";
import react, { useEffect, useState } from "react";
import { userDummyData } from '../assets/assets';
import { useNavigate } from "react-router-dom";


const Sidebar = ({ selectedUser, setSelectedUser }) => {
    const [usersData, setUsersData] = useState([]);
    const [showMore, setShowMore] = useState(false);

    const status = "active";
    const navigate = useNavigate();

    useEffect(() => {
        setUsersData(userDummyData);
        console.log(selectedUser)
    }, [selectedUser])

    const doLogout = () => {

    }

    const fetchChats = () => {

    }

    return (
        <div className='border border-r rounded-2xl border-gray-600'>
            <div className='flex flex-col p-2 gap-3'>
                <div className='flex flex-row justify-between items-center'>
                    <img src='/src/assets/logo.png' alt="logo" width="200px" height="200px" />
                    <div
                        className='relative'
                        onMouseEnter={() => setShowMore(true)}

                    >
                        <EllipsisVertical className='hover' />
                        {showMore &&
                            <div className='text-sm absolute right-3 top-7 border rounded-md bg-[#282142]  w-[80px]  z-20'
                                onMouseEnter={() => setShowMore(true)}
                                onMouseLeave={() => setShowMore(false)}
                            >
                                <ul className='flex flex-col'>
                                    <li className='cursor-pointer' onClick={() => navigate('/profile')}>Edit</li>
                                    <hr />
                                    <li className='cursor-pointer' onClick={() => doLogout()}>Logout</li>
                                </ul>
                            </div>
                        }
                    </div>

                </div>

                <div className="flex border rounded-full items-center px-2 gap-1  mt-3">
                    <Search width="20px" height="20px" />
                    <input className="text-white text-sm bg-transparent  border-none outline-none w-[100%] p-2 flex-1" type="text" placeholder="Search.." />

                </div>

                <div className="flex flex-col justify-center gap-3 mt-4 ">
                    <div className="flex flex-col gap-3 overflow-auto max-h-[400px]">
                        {usersData.map((user, index) => (
                            <div
                                key={user._id}
                                className={`flex flex-row text-white py-1 gap-3 border-b-0.5 rounded-md border-gray-600 relative ${selectedUser?._id === user._id && 'bg-gray-600'}`
                                }
                                onClick={() => {
                                    fetchChats(user);
                                    setSelectedUser(user);
                                }}
                            >
                                <img
                                    src={user.profilePic}
                                    alt="pic"
                                    width="50"
                                    height="50"
                                    className="rounded-full"
                                />
                                <div className='flex flex-col gap-1'>
                                    <p>{user.fullName}</p>
                                    {/* <p className={`text-xs ${user.seen==='seen' ? 'text-green-200':'text-gray-200'}`}>{user.seen ? 'Online' : 'Offline'}</p> */}
                                    <p className={`text-sm ${status == "active" ? 'text-green-200' : 'text-gray-200'}`}>{status == 'active' ? 'Online' : 'Offline'}</p>
                                </div>


                                <p className='absolute right-2 top-5 text-sm border  rounded-full h-6 w-6 flex justify-center items-center backdrop-blur '>4</p>




                            </div>
                        ))}
                    </div>

                </div>


            </div>
        </div>
    )
}

export default Sidebar;