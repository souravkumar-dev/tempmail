# 📧 MailGhost — Real Temporary Email Service for OTP Verification
Vercel Link: https://tempmail-six-rho.vercel.app/

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone and install
git clone <repo-url> && cd tempmail
npm install

# 2. Start the SMTP server (needs root/admin for port 25, or use 2525)
node smtp-server/server.js &

# 3. Start Next.js
npm run dev

# 4. Open http://localhost:3000
```

## 🐳 Deploy with Docker

```bash
# 1. Clone the repo
git clone <repo-email> && cd tempmail

# 2. Configure your domain
cp .env.example .env
# Edit .env and set ALLOWED_DOMAINS=yourdomain.com

# 3. Deploy
docker-compose up -d

# 4. That's it! SMTP on port 25, Web on port 3000
```

