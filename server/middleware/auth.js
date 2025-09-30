

//Middleware - Protect routes

import User from "../models/users.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req,res,next) => {
    try{
        const token = req.headers.token;
        if(!token){
            return res.json({success:false,message:"Unauthotized access"});
        }

        const decode = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decode.userId).select("-password");
        if(!user){
            return res.json({success:false,message:"User not found"});
        }

        req.user = user;
        next();
    }catch(err){
        console.error(err.message);
        res.json({success:false,message:err.message});

    }

}


