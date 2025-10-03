import express from "express";
import Ably from "ably";
import "dotenv/config";

const router = express.Router();

router.get("/auth", async (req, res) => {
  const clientId = req.query.userId;
  if (!clientId) return res.status(400).json({ error: "Missing userId" });

  try {
    console.log("cline",clientId);
    const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
    const tokenRequest = await ably.auth.createTokenRequest({ clientId });
    res.json(tokenRequest);
  } catch (err) {
    console.error("Ably token request error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
