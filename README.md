# Chat App

A real-time one-to-one chat application built with React (frontend), Express + Node.js (backend), MongoDB (database), and Ably (for real-time messaging). Users can sign up, log in, chat with others in real time, mark messages as seen, and view shared media.

## Features

- User authentication (signup / login) using JWT  
- Real-time messaging between users via Ably  
- Mark messages as "seen"  
- View conversation list / recent chats  
- Fetch and display unseen message counts  
- Upload images in chat (via Cloudinary)  
- Search users  
- Profile update  
- Shared media retrieval  

## Demo
    https://chat-app-frontend-tenzins-projects-246f77e7.vercel.app/

## Tech Stack

| Layer       | Technology                             |
|--------------|------------------------------------------|
| Frontend     | React, Vite, Tailwind CSS, Axios         |
| Backend      | Node.js, Express                         |
| Real-time    | Ably Realtime (for message events)       |
| Database     | MongoDB                                  |
| File Storage | Cloudinary (for image uploads)           |
| Authentication | JWT + Protected Routes                 |
| Vercel       | A cloud platform for deploying web apps  |
|              |  and APIs.

## Folder Structure

```
/client                # frontend React app
  ├─ src
      ├─ pages/
      ├─ components/
      ├─ context/
      └─ ...
/server                # backend Express app
  ├─ controllers/
  ├─ routes/
  ├─ middleware/
  ├─ lib/               # e.g., database connection, cloudinary setup
  ├─ models/
  └─ app.js / index.js
.env (server only)
README.md
```

## Getting Started (Local Development)

### Prerequisites

- Node.js (>= 14 or 16)  
- MongoDB (local or a cloud instance)  
- An Ably account with API key  
- Cloudinary account (for image uploads)  

### Setup Backend

1. Clone the repo and navigate to backend folder:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file with environment variables:
  1. Server env variables 
   ```env
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   ABLY_API_KEY=your_ably_root_key
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
   
   2. Client env variables
   VITE_BACKEND_URL=http://localhost:5000


4. Start the backend:

   ```bash
   npm run dev
   ```

5. Verify backend is running by visiting:

   ```
   http://localhost:5000/api/status
   ```

### Setup Frontend

1. Open another terminal, go to client folder:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file (React / Vite) with frontend environment variables:

   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. Start the frontend:

   ```bash
   npm run dev
   ```

5. Open browser at `http://localhost:5173` (or whichever port Vite uses)

---

## Ably Integration & Real-time Flow

1. The frontend initializes an Ably `Realtime` client with:

   ```js
   new Realtime({
     authUrl: `${VITE_BACKEND_URL}/api/ably/auth?userId=${authUser._id}`
   });
   ```

2. The backend provides a route at `/api/ably/auth` which uses Ably’s server SDK to generate a **token request**:

   ```js
   const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
   const tokenRequest = await ably.auth.createTokenRequest({ clientId: userId });
   res.json(tokenRequest);
   ```

3. Once authenticated, clients subscribe to channels (e.g. `user:{userId}`) to receive events like `newMessage` or `messagesSeen`.

4. To send a message, you publish to the appropriate Ably channel and also persist it in MongoDB.

---

## API Endpoints

### Auth / User

| Method | Path | Description |
|--------|------|-------------|
| `POST /api/auth/signup` | Sign up a new user |
| `POST /api/auth/login` | Log in and receive JWT |
| `PUT /api/auth/update-profile` | Update user profile (protected) |
| `GET /api/auth/check-auth` | Return current user if JWT valid |
| `GET /api/auth/all-users` | List all users (protected) |
| `GET /api/auth/searchUser/:search` | Search users by text (protected) |

### Messaging

| Method | Path | Description |
|--------|------|-------------|
| `GET /api/messages/recent-chats/:id` | Get list of recent chats (protected) |
| `GET /api/messages/unseen-count` | Get unseen message counts per user (protected) |
| `GET /api/messages/all-messages/:id` | Get message history with user `id` (protected) |
| `PUT /api/messages/mark-seen/:id` | Mark messages from user `id` as seen |
| `POST /api/messages/send-message/:id` | Send message (text + optional image) to user `id` |
| `GET /api/ably/auth?userId=...` | Get Ably token request |

---

## Deployment (Vercel + Node Serverless)

- The backend is deployed as serverless functions (no `app.listen()` in production).  
- Ensure environment variables are set in Vercel for `ABLY_API_KEY`, `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`.  
- The React frontend is deployed via Vercel as well, pointing to backend routes.  
- Confirm `/api/status` works after deployment to check the function is live.

## Vercel configurations

   1. Create a vercel.json at the Server folder of your repo:

            {
      "version": 2,
      "builds": [
         {
            "src": "server.js",
            "use": "@vercel/node",
            "config": {
            "includeFiles": [
               "dist/**"
            ]
            }
         }
      ],
      "rewrites": [
         {
            "source": "/(.*)",
            "destination": "/server.js"
         }
      ],
      "headers": [
         {
            "source": "/api/(.*)",
            "headers": [
            { "key": "Access-Control-Allow-Origin", "value": "https://app.example" },
            { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
            { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" },
            { "key": "Access-Control-Allow-Credentials", "value": "true" }
            ]
         }
      ]
      }

   2. Create a vercel.json at the Client folder of your repo:
            {
         "rewrites":[
            {
                  "source":"/(.*)",
                  "destination":"/"
            }
         ]
      }



---

## Troubleshooting

- **500 / INTERNAL_SERVER_ERROR** on `/api/status` → check logs, ensure `.env` is loaded and no `app.listen()` in production.  
- **Ably Error “No key specified” (40101)** → ensure `process.env.ABLY_API_KEY` is valid and loaded properly before creating `Ably.Rest`.  
- **404 on `/api/ably/auth`** → check routing: `app.use("/api/ably", ablyRouter)`, and in `ablyRouter` route should be `router.get("/auth")`.  
- **CORS / network issues** → make sure backend allows your frontend origin.

---

## Future Improvements

- Add error handling and validation on endpoints  
- Support group chats / rooms  
- Support file attachments beyond images (videos, docs)  
- Add read receipts and typing indicators  
- Better UI/UX, notifications  
- Unit tests / integration tests  
- Logging and monitoring  
