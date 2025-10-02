import express from "express";
import { allUsers, checkAuth, searchUser, login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// CORS middleware for this router
userRouter.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile",protectRoute,updateProfile);
userRouter.get("/check-auth",protectRoute,checkAuth);
userRouter.get("/all-users",protectRoute,allUsers);
userRouter.get("/searchUser/:search", protectRoute,searchUser)

export default userRouter;
