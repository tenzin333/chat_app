import avatar_icon from './avatar_icon.png'
import gallery_icon from './gallery_icon.svg'
import help_icon from './help_icon.png'
import logo_icon from './logo_icon.svg'
import logo_big from './logo_big.svg'
import logo from './logo.png'
import profile_richard from './profile_richard.png'
import profile_alison from './profile_alison.png'
import profile_enrique from './profile_enrique.png'
import profile_marco from './profile_marco.png'
import profile_martin from './profile_martin.png'
import search_icon from './search_icon.png'
import send_button from './send_button.svg'
import menu_icon from './menu_icon.png'
import arrow_icon from './arrow_icon.png'
import code from './code.svg'
import bgImage from './bgImage.svg'
import pic1 from './pic1.png'
import pic2 from './pic2.png'
import pic3 from './pic3.png'
import pic4 from './pic4.png'
import img1 from './img1.jpg'
import img2 from './img2.jpg'

const assets = {
    avatar_icon,
    gallery_icon,
    help_icon,
    logo_big,
    logo_icon,
    logo,
    search_icon,
    send_button,
    menu_icon,
    arrow_icon,
    code,
    bgImage,
    profile_martin
}

export default assets;

export const imagesDummyData = [pic1, pic2, pic3, pic4, pic1, pic2]


export const userDummyData = [
  {
    _id: "680f50aaf10f3cd28382ecf2",
    email: "test1@greatstack.dev",
    fullName: "Alison Martin",
    profilePic: profile_alison,
    bio: "Hi Everyone, I am Using QuickChat",
  },
  {
    _id: "680f50e4f10f3cd28382ecf9",
    email: "test2@greatstack.dev",
    fullName: "Martin Johnson",
    profilePic: profile_martin,
    bio: "Hi Everyone, I am Using QuickChat",
  },
  {
    _id: "680f510af10f3cd28382ed01",
    email: "test3@greatstack.dev",
    fullName: "Enrique Martinez",
    profilePic: profile_enrique,
    bio: "Hi Everyone, I am Using QuickChat",
  },
  {
    _id: "680f5137f10f3cd28382ed10",
    email: "test4@greatstack.dev",
    fullName: "Marco Jones",
    profilePic: profile_marco,
    bio: "Hi Everyone, I am Using QuickChat",
  },
  {
    _id: "680f516cf10f3cd28382ed11",
    email: "test5@greatstack.dev",
    fullName: "Richard Smith",
    profilePic: profile_richard,
    bio: "Hi Everyone, I am Using QuickChat",
  },
  {
    _id: "680f5200f10f3cd28382ed22",
    email: "test6@greatstack.dev",
    fullName: "Sophia Williams",
    profilePic: profile_alison,
    bio: "Loving QuickChat 🚀",
  },
  {
    _id: "680f5212f10f3cd28382ed23",
    email: "test7@greatstack.dev",
    fullName: "James Anderson",
    profilePic: profile_martin,
    bio: "Available for chat anytime!",
  },
  {
    _id: "680f5220f10f3cd28382ed24",
    email: "test8@greatstack.dev",
    fullName: "Emily Davis",
    profilePic: profile_enrique,
    bio: "Coffee + Chats ☕",
  },
  {
    _id: "680f5230f10f3cd28382ed25",
    email: "test9@greatstack.dev",
    fullName: "David Wilson",
    profilePic: profile_marco,
    bio: "Here to connect 🙌",
  },
  {
    _id: "680f5240f10f3cd28382ed26",
    email: "test10@greatstack.dev",
    fullName: "Olivia Brown",
    profilePic: profile_richard,
    bio: "QuickChat is awesome 💬",
  },
];

export const messagesDummyData = [
  {
    _id: "680f571ff10f3cd28382f094",
    senderId: "680f5116f10f3cd28382ed02",
    receiverId: "680f50e4f10f3cd28382ecf9",
    text: "Hey Martin! How’s your day going?",
    seen: true,
    createdAt: "2025-04-28T10:23:27.844Z",
  },
  {
    _id: "680f5726f10f3cd28382f0b1",
    senderId: "680f50e4f10f3cd28382ecf9",
    receiverId: "680f5116f10f3cd28382ed02",
    text: "Pretty good, working on a new project.",
    seen: true,
    createdAt: "2025-04-28T10:23:34.520Z",
  },
  {
    _id: "680f5729f10f3cd28382f0b6",
    senderId: "680f5116f10f3cd28382ed02",
    receiverId: "680f50e4f10f3cd28382ecf9",
    text: "Nice! Can’t wait to hear more about it.",
    seen: true,
    createdAt: "2025-04-28T10:23:37.301Z",
  },
  {
    _id: "680f572cf10f3cd28382f0bb",
    senderId: "680f50e4f10f3cd28382ecf9",
    receiverId: "680f5116f10f3cd28382ed02",
    text: "Sure, let’s catch up later today?",
    seen: true,
    createdAt: "2025-04-28T10:23:40.334Z",
  },
  {
    _id: "680f573cf10f3cd28382f0c0",
    senderId: "680f50e4f10f3cd28382ecf9",
    receiverId: "680f5116f10f3cd28382ed02",
    image: img1,
    seen: true,
    createdAt: "2025-04-28T10:23:56.265Z",
  },
  {
    _id: "680f5745f10f3cd28382f0c5",
    senderId: "680f5116f10f3cd28382ed02",
    receiverId: "680f50e4f10f3cd28382ecf9",
    image: img2,
    seen: true,
    createdAt: "2025-04-28T10:24:05.164Z",
  },
  {
    _id: "680f5748f10f3cd28382f0ca",
    senderId: "680f5116f10f3cd28382ed02",
    receiverId: "680f50e4f10f3cd28382ecf9",
    text: "That picture looks amazing 🔥",
    seen: true,
    createdAt: "2025-04-28T10:24:08.523Z",
  },
  {
    _id: "680f5749f10f3cd28382f0cb",
    senderId: "680f50aaf10f3cd28382ecf2",
    receiverId: "680f5200f10f3cd28382ed22",
    text: "Hi Sophia, are you free this weekend?",
    seen: false,
    createdAt: "2025-04-28T11:00:15.523Z",
  },
  {
    _id: "680f574af10f3cd28382f0cc",
    senderId: "680f5200f10f3cd28382ed22",
    receiverId: "680f50aaf10f3cd28382ecf2",
    text: "Yes, let’s plan something fun! 🎉",
    seen: false,
    createdAt: "2025-04-28T11:02:45.123Z",
  },
  {
    _id: "680f574bf10f3cd28382f0cd",
    senderId: "680f5212f10f3cd28382ed23",
    receiverId: "680f5230f10f3cd28382ed25",
    text: "Hey David, check your email please.",
    seen: true,
    createdAt: "2025-04-28T12:14:32.412Z",
  },
  {
    _id: "680f574cf10f3cd28382f0ce",
    senderId: "680f5230f10f3cd28382ed25",
    receiverId: "680f5212f10f3cd28382ed23",
    text: "Just did 👍 Thanks James!",
    seen: true,
    createdAt: "2025-04-28T12:15:05.999Z",
  },
  {
    _id: "680f574df10f3cd28382f0cf",
    senderId: "680f5220f10f3cd28382ed24",
    receiverId: "680f5240f10f3cd28382ed26",
    text: "Olivia, did you finish the report?",
    seen: true,
    createdAt: "2025-04-28T13:45:55.523Z",
  },
  {
    _id: "680f574ef10f3cd28382f0d0",
    senderId: "680f5240f10f3cd28382ed26",
    receiverId: "680f5220f10f3cd28382ed24",
    text: "Almost done, sending it soon 📩",
    seen: true,
    createdAt: "2025-04-28T13:47:12.812Z",
  },
  {
    _id: "680f574ff10f3cd28382f0d1",
    senderId: "680f510af10f3cd28382ed01",
    receiverId: "680f5137f10f3cd28382ed10",
    text: "Marco! Long time no see 😄",
    seen: true,
    createdAt: "2025-04-28T14:20:21.645Z",
  },
  {
    _id: "680f5750f10f3cd28382f0d2",
    senderId: "680f5137f10f3cd28382ed10",
    receiverId: "680f510af10f3cd28382ed01",
    text: "Haha true! Let’s grab coffee ☕",
    seen: true,
    createdAt: "2025-04-28T14:21:35.321Z",
  },
];

