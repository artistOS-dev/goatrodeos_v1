# GoatRodeos - Song Rating App

A full-stack web application for hosting interactive "rodeos" where listeners can rate songs on a 1-5 star scale. Perfect for group listening sessions or collaborative music rating!

## 🎯 Features

### For Listeners
- **Join Rodeos** via unique shareable links
- **Rate Songs** 1-5 stars in real-time
- **See Live Stats** of average ratings and vote counts
- **Update Ratings** - change your rating anytime during the rodeo

### For Rodeo Masters (Admin)
- **Create Rodeos** with custom names and durations
- **Add Songs** with titles, artists, and durations
- **Generate Unique Links** for sharing with listeners
- **View Results** with live statistics and rankings
- **Manage Rodeos** - edit, update, or delete as needed

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: PostgreSQL
- **Deployment**: Vercel-friendly (simple & lightweight)

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (v12+)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repo-url>
cd goatrodeos_v1
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Database Setup

Create a PostgreSQL database:
```bash
createdb goatrodeos
```

Create a `.env` file in the `server` directory and copy from example:
```bash
cp server/.env.example server/.env
```

Update `server/.env` with your database URL:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/goatrodeos
JWT_SECRET=your-secret-key-change-in-production
```

Run the database setup:
```bash
cd server
npm run db:setup
npm run db:seed  # Optional: adds sample data
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚀 Usage

### For Listeners
1. Visit `http://localhost:3000`
2. Enter the rodeo link provided by the admin
3. Rate each song with 1-5 stars
4. Your ratings are saved automatically

### For Admins
1. Visit `http://localhost:3000/admin`
2. Click "Create New Rodeo"
3. Enter rodeo name and duration
4. Add songs to the rodeo
5. Copy the unique link and share with listeners
6. Monitor voting results in real-time

## 📁 Project Structure

```
goatrodeos_v1/
├── server/                    # Express backend
│   ├── src/
│   │   ├── db/               # Database setup and migrations
│   │   ├── routes/           # API routes
│   │   │   ├── rodeos.ts     # Rodeo CRUD
│   │   │   ├── songs.ts      # Song management
│   │   │   └── ratings.ts    # Rating submission
│   │   ├── middleware/       # CORS and other middleware
│   │   ├── types/            # TypeScript types
│   │   └── index.ts          # Express app entry point
│   ├── package.json
│   └── tsconfig.json
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── RodeoVote.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── components/       # Reusable components
│   │   │   ├── StarRating.tsx
│   │   │   └── SongCard.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and API
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── package.json              # Root workspace config
```

## 🔌 API Endpoints

### Rodeos
- `POST /api/rodeos` - Create a new rodeo
- `GET /api/rodeos` - Get all rodeos
- `GET /api/rodeos/:id` - Get rodeo details
- `GET /api/rodeos/link/:unique_link` - Get rodeo by unique link
- `PUT /api/rodeos/:id` - Update a rodeo
- `DELETE /api/rodeos/:id` - Delete a rodeo

### Songs
- `POST /api/songs` - Add a song to a rodeo
- `GET /api/songs/rodeo/:rodeo_id` - Get songs for a rodeo
- `PUT /api/songs/:id` - Update a song
- `DELETE /api/songs/:id` - Delete a song

### Ratings
- `POST /api/ratings` - Submit a rating
- `GET /api/ratings/song/:song_id` - Get ratings for a song
- `GET /api/ratings/rodeo/:rodeo_id/user/:user_session_id` - Get user's ratings
- `GET /api/ratings/rodeo/:rodeo_id/stats` - Get rodeo statistics

## 🗄️ Database Schema

### Rodeos Table
```sql
- id (UUID, primary key)
- name (VARCHAR)
- unique_link (VARCHAR, unique)
- created_by (VARCHAR)
- start_date (TIMESTAMP)
- end_date (TIMESTAMP)
- status (active, ended, draft)
- created_at, updated_at (TIMESTAMP)
```

### Songs Table
```sql
- id (UUID, primary key)
- rodeo_id (UUID, foreign key)
- title (VARCHAR)
- artist (VARCHAR)
- duration (INTEGER)
- spotify_url, youtube_url (TEXT)
- created_at (TIMESTAMP)
```

### Ratings Table
```sql
- id (UUID, primary key)
- rodeo_id (UUID, foreign key)
- song_id (UUID, foreign key)
- user_session_id (VARCHAR)
- user_ip (VARCHAR)
- rating (INTEGER, 1-5)
- created_at (TIMESTAMP)
```

## 📦 Building for Production

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
```

The `dist` folder will contain the optimized production build.

## 🚢 Deployment Options

### Frontend (Vercel)
1. Push code to GitHub
2. Import repo to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy - automatic on push

### Backend (Railway / Render / Fly.io / etc)
1. Push code to GitHub
2. Connect repo to hosting platform
3. Set environment variables (DATABASE_URL, NODE_ENV, etc)
4. Deploy

### Alternative: Monolith Deployment
Deploy frontend and backend together on a single server (Ubuntu/Linux):
- Use PM2 or systemd for process management
- Use Nginx as reverse proxy
- Let's Encrypt for SSL
- PostgreSQL hosted on same or separate server

## 🔐 Security Notes

- Change `JWT_SECRET` in production
- Use PostgreSQL with SSL in production
- Set proper CORS origins
- Validate all user inputs (express-validator included)
- Use environment variables for sensitive data
- Enable HTTPS/SSL on production

## 🐛 Troubleshooting

### "Connection refused" on database
- Ensure PostgreSQL is running: `sudo systemctl start postgresql`
- Check DATABASE_URL is correct
- Verify database exists: `psql -l`

### CORS errors
- Make sure frontend URL is in CORS whitelist in `server/src/middleware/cors.ts`
- Check backend is running on correct port

### Frontend not connecting to API
- Verify backend is running on port 5000
- Check proxy configuration in `client/vite.config.ts`
- Check `VITE_API_URL` environment variable

### Database migration errors
- Delete and recreate database: `dropdb goatrodeos && createdb goatrodeos`
- Run setup again: `npm run db:setup`

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Made with 🎵 for music lovers
