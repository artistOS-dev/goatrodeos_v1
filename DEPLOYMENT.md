# Production Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Update `JWT_SECRET` in .env
- [ ] Set `NODE_ENV=production`
- [ ] Use SSL/HTTPS for both frontend and backend
- [ ] Configure database with SSL/TLS
- [ ] Set proper CORS origins
- [ ] Enable rate limiting (optional)
- [ ] Setup monitoring/logging
- [ ] Test with production dependencies

---

## 🚀 Option 1: Monolith Deployment (Single Server)

### Recommended For
- Small to medium projects
- Lower cost
- Simpler management

### Setup on Ubuntu/Linux Server

#### 1. Install Dependencies
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Nginx
sudo apt-get install -y nginx

# PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Setup Database
```bash
sudo -u postgres psql << EOF
CREATE DATABASE goatrodeos;
CREATE USER goatrodeos_user WITH ENCRYPTED PASSWORD 'your-secure-password';
ALTER ROLE goatrodeos_user SET client_encoding TO 'utf8';
ALTER ROLE goatrodeos_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE goatrodeos_user SET default_transaction_deferrable TO on;
ALTER ROLE goatrodeos_user SET default_transaction_level TO '3';
GRANT ALL PRIVILEGES ON DATABASE goatrodeos TO goatrodeos_user;
\q
EOF
```

#### 3. Clone and Setup App
```bash
cd /home/ubuntu
git clone <your-repo-url> goatrodeos
cd goatrodeos

# Install dependencies
npm run install-all

# Build applications
npm run build

# Run database setup
cd server
npm run db:setup
cd ..
```

#### 4. Setup Environment Variables
```bash
# server/.env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://goatrodeos_user:your-secure-password@localhost:5432/goatrodeos
JWT_SECRET=your-super-secret-key-32-chars-min!!
FRONTEND_URL=https://yourdomain.com
```

#### 5. Start Backend with PM2
```bash
pm2 start "npm start" --env production --name goatrodeos-api -cwd /home/ubuntu/goatrodeos/server

# Save PM2 config to auto-restart on reboot
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### 6. Setup Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/goatrodeos`:
```nginx
upstream api {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend (React build)
    root /home/ubuntu/goatrodeos/client/dist;
    index index.html;

    location / {
        # SPA routing
        try_files $uri $uri/ /index.html;
    }

    # Static assets cache
    location /assets {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/goatrodeos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🚀 Option 2: Frontend on Vercel, Backend on Railway

### Frontend (Vercel)

1. Push to GitHub
2. Import repo at https://vercel.com/new
3. Set build command: `cd client && npm run build`
4. Set output directory: `client/dist`
5. Set environment variables:
   ```
   VITE_API_URL=https://your-railway-app.railway.app/api
   ```
6. Deploy

### Backend (Railway)

1. Create account at https://railway.app
2. Connect GitHub repo
3. Add PostgreSQL database
4. Set environment variables:
   ```
   NODE_ENV=production
   PORT=$PORT  # Railway sets this
   DATABASE_URL=$DATABASE_URL  # Railway provides this
   JWT_SECRET=your-secret-key
   ```
5. Set start command: `cd server && npm run build && npm start`
6. Deploy

---

## 🚀 Option 3: Docker Deployment

Create `Dockerfile` in root:

```dockerfile
# Build stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm run install-all
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Install postgresql client
RUN apk add --no-cache postgresql-client

# Copy built files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/node_modules ./client/node_modules
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY package*.json ./

EXPOSE 5000

WORKDIR /app/server
CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: goatrodeos
      POSTGRES_USER: goatrodeos_user
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://goatrodeos_user:your-password@postgres:5432/goatrodeos
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose up -d
```

---

## 📊 Monitoring & Maintenance

### Log Files
```bash
# View API logs
pm2 logs goatrodeos-api

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Database Backup
```bash
# Manual backup
pg_dump -U goatrodeos_user goatrodeos > backup.sql

# Restore
psql -U goatrodeos_user goatrodeos < backup.sql

# Automated backup (cron)
0 2 * * * pg_dump -U goatrodeos_user goatrodeos > /backups/goatrodeos-$(date +\%Y\%m\%d).sql
```

### Updates
```bash
# Pull latest code
cd /home/ubuntu/goatrodeos
git pull origin main

# Rebuild
npm run build

# Restart application
pm2 restart goatrodeos-api
sudo systemctl restart nginx
```

---

## 🔐 Security Best Practices

1. **Never commit secrets**
   ```bash
   # Add to .gitignore
   .env
   .env.production
   ```

2. **Use strong passwords**
   - Database: 32+ characters, mixed
   - JWT Secret: 32+ characters, random

3. **Enable firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

4. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

5. **Setup CORS properly**
   ```typescript
   // Only allow your domain
   const corsOptions = {
     origin: 'https://yourdomain.com',
     credentials: true
   };
   ```

---

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs` or Nginx logs
2. Test API: `curl https://yourdomain.com/api/rodeos`
3. Check database: `psql -U goatrodeos_user -d goatrodeos -c "SELECT * FROM rodeos;"`
