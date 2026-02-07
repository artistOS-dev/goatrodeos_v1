# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js v18+ 
- PostgreSQL running
- Git

### Step 1: Setup Database
```bash
createdb goatrodeos
```

### Step 2: Install Dependencies
```bash
cd /workspaces/goatrodeos_v1
npm run install-all
```

### Step 3: Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
```

### Step 4: Initialize Database
```bash
npm run db:setup
npm run db:seed  # Optional: adds sample rodeo
```

### Step 5: Start Both Servers
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2  
cd client && npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🎮 First Time Usage

### Create Your First Rodeo (Admin)
1. Go to http://localhost:3000/admin
2. Click "Create New Rodeo"
3. Fill in name and end date
4. Click "Create Rodeo"
5. Click on your rodeo
6. Add some songs
7. Copy the voting link

### Vote on Songs (Listener)
1. Go to http://localhost:3000
2. Paste the rodeo link
3. Click "Join Rodeo"
4. Rate songs with stars ⭐
5. Your ratings save instantly!

---

## 📱 Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Home - Join a rodeo |
| `/admin` | Rodeo master dashboard |
| `/vote/:link` | Voter page for a specific rodeo |

---

## 🔧 Available Commands

### Root
```bash
npm run install-all    # Install all dependencies
npm run dev            # Start both servers
npm run build          # Build for production
```

### Server
```bash
npm run dev            # Development with hot reload
npm run build          # Build TypeScript
npm start              # Run production build
npm run db:setup       # Initialize database
npm run db:seed        # Add sample data
```

### Client
```bash
npm run dev            # Development server (port 3000)
npm run build          # Production build
npm run preview        # Preview production build
```

---

## 🌐 Networking

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **DB**: localhost:5432

### Frontend calls Backend at:
- Development: `http://localhost:5000/api` (via Vite proxy)
- Production: Set `VITE_API_URL` environment variable

---

## 💡 Tips

- Song ratings update live on the admin dashboard
- Each browser session gets a unique ID (stored locally)
- You can rate the same song multiple times (it updates)
- Rodeo links can be shared via QR code or direct link
- Admin can see real-time voting statistics

---

## 🐛 Need Help?

✗ **Database won't connect?**
- Check PostgreSQL is running: `sudo systemctl start postgresql`
- Verify DATABASE_URL in server/.env

✗ **Frontend won't load?**
- Kill port 3000: `lsof -ti:3000 | xargs kill -9`
- Restart client with `npm run dev`

✗ **API calls failing?**
- Check backend is running on port 5000
- Look at browser console for error details
- Check server logs for API errors
