import { generateToken } from "../lib/utils.js";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"; 

//signup user
export const signup = async (req,res) => {
    const {fullName,email,password} = req.body;

    try{
        if(!fullName || !email || !password){
              return res.json({success:false, message:"Missing details"});  
        }
        const user  = await User.findOne({email});

        if(user){
             return res.json({success:false,message:"Email already registered"});   
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.bash(password,salt);

        const newUser  = await User.create({
            fullName,email,password:hashedPassword,bio
        });

        const token =  generateToken(newUser._id);
        res.json({success:true, userData:newUser, message:"Account created successfully", token});

    }catch(err){
        console.error(err.message);
        res.json({success:false,message:err.message});
    }


}

//login user
export const login = async (req,res) => {
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.json({success:false, message:"Missing details"})
        }
        const userData = await User.findOne({email});
        const isMath = await bcrypt.compare(password,userData.password);

        if(!isMath){
            return res.json({success:false, message:"Invalid credentails"});
        }

        const token = generateToken(userData._id);
        res.json({success:true. userData , message:"Login successful", token});
    }catch(err){
        console.error(err.message);
        res.json({success:false,message:err.message});
    }
}

//authenticate user
export const checkAuth = async (req,res) => {
    res.json({success:true, user:req.user})
}

//to update user profile
export const updateProfile = async (req,res) => {
    try{
        const {profilePic,bio,fullName} = req.body;
        const userId = req.user._id;
        let updatedUser = {};

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true}).select("-password");
        }else{
           const  upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId,{bio,profilePic:upload.secure_url,fullName},{new:true}).select("-password");
        }

        res.json({success:true,user:updatedUser,message:"Profile updated successfully"});
    
    }catch(err){
        console.error(err.message);
        res.json({success:false,message:err.message});
    }
}