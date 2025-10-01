import express from "express";
import { allUsers, checkAuth, searchUser, login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile",protectRoute,updateProfile);
userRouter.get("/check-auth",protectRoute,checkAuth);
userRouter.get("/all-users",protectRoute,allUsers);
userRouter.get("/searchUser/:search", protectRoute,searchUser)

export default userRouter;
