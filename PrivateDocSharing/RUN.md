# PrivateAI Agent Workspace — Setup & Run Instructions

This guide provides step-by-step instructions to configure, run, and verify both the **Backend API Server** and **Frontend React Client** locally.

---

## 🛠️ Prerequisites

Before you start, make sure you have the following installed on your machine:
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)
- **MongoDB** (Running locally on `mongodb://localhost:27017` or using a MongoDB Atlas URI)

---

## 📂 Project Structure

```text
frontend tech titans/
├── client/          # Frontend React Application (Vite + Tailwind CSS v4)
├── backend/         # Backend Node.js/Express Server
├── PROGRESS.md      # Full Stage Implementation History
└── RUN.md           # Setup & Run Instructions (This File)
```

---

## ⚙️ 1. Setup & Configuration

### A. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend/server
   ```
2. Create your `.env` configuration file by copying the template:
   ```bash
   cp .env.example .env
   ```
3. Open `backend/server/.env` and verify the values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/privateai
   ```
   *(Ensure MongoDB is running locally, or replace MONGODB_URI with your Atlas database connection string).*

### B. Frontend Setup
1. Open a separate terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
3. Open `client/.env` and ensure the values match the backend port:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   VITE_ORGANIZATION_EMAIL_DOMAIN=techtitans.com
   ```

---

## 🚀 2. Running the Application

To run the full stack, you need to start both servers simultaneously:

### Step 1: Start the Backend API Server
In your backend terminal (`backend/server` directory):
```bash
npm install
npm start
```
*The server will start listening on port **5000**.*

### Step 2: Start the Frontend React Client
In your frontend terminal (`client` directory):
```bash
npm install
npm run dev
```
*Vite will compile the code and start the local development server on **http://localhost:5173/**.*

---

## 💻 3. Verifying the Flow (Demo Mode)

1. Open your browser and navigate to: **[http://localhost:5173/register](http://localhost:5173/register)**
2. Create a new account:
   - **Name:** Your Name
   - **Email:** Must end with `@techtitans.com` (e.g. `admin@techtitans.com`)
   - **Password:** Minimum 8 characters
3. Click **Create account**.
4. Log in using the registered credentials on the login screen.
5. You will be redirected to the **Role-Aware Dashboard** where you can:
   - View document metrics and active request summaries.
   - Upload new files in the **Documents** catalog (restricted to Owner/Reviewer).
   - Draw, clear, and submit signatures on pending requests.
   - Interact with the **AI Agent Command Hub** with confirmation loops.

---

## 📦 4. Building for Production

To build the optimized frontend client bundle for production:
```bash
cd client
npm run build
```
The compiled, production-ready static assets will be outputted to the `client/dist/` folder.
