# 📧 MailGhost — Real Temporary Email Service for OTP Verification
Vercel Link: tempmail-six-rho.vercel.app

A production-ready, self-hosted temporary email service. Users get disposable email addresses on your custom domain to receive real OTP codes from any website — including Google, Groww, banking apps, and more.

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
│              Next.js + Tailwind + Framer Motion                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP (port 3000)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Web App                             │
│  • User creates email: alice@yourdomain.com                     │
│  • Generates random username or custom prefix                   │
│  • Polls for incoming messages every 3-5 seconds                │
│  • Auto-detects and highlights OTP codes                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Internal HTTP (port 3001)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SMTP Mail Server (Node.js)                    │
│  • Listens on port 25 for incoming emails                       │
│  • Parses email with mailparser                                 │
│  • Stores in SQLite database                                    │
│  • Auto-extracts OTP codes from email body                      │
│  • Exposes HTTP API for querying messages                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Port 25 (SMTP)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Custom Domain (e.g., tempver.com)                  │
│  • MX record → points to your server IP                         │
│  • SPF record → authorizes your server to receive               │
│  • DKIM → optional, improves deliverability                     │
└─────────────────────────────────────────────────────────────────┘
```

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

## 🌐 DNS Configuration (CRITICAL)

For the emails to actually work, you MUST configure DNS records for your domain:

### Step 1: Buy a Domain
Buy a clean domain from Namecheap, Cloudflare, Porkbun, etc.
- Good examples: `tempver.com`, `tempmail.pro`, `mythrowaway.email`
- Avoid: `.xyz`, `.top` TLDs (often pre-blocked by Google)

### Step 2: Set MX Record
```
Type: MX
Name: @ (or yourdomain.com)
Value: mail.yourdomain.com
Priority: 10
TTL: 3600
```

### Step 3: Set A Record for Mail Server
```
Type: A
Name: mail
Value: YOUR_SERVER_IP
TTL: 3600
```

### Step 4: Set SPF Record (Important!)
```
Type: TXT
Name: @
Value: "v=spf1 mx a ~all"
TTL: 3600
```

### Step 5: Set DKIM (Optional but Recommended)
```bash
# Generate DKIM key
openssl genrsa -out dkim-private.pem 2048
openssl rsa -in dkim-private.pem -pubout -out dkim-public.pem

# Add DNS record
Type: TXT
Name: default._domainkey
Value: "v=DKIM1; k=rsa; p=<contents of dkim-public.pem>"
```

### Step 6: Verify DNS
```bash
# Check MX record
dig MX yourdomain.com

# Check if port 25 is reachable
telnet mail.yourdomain.com 25

# Test sending an email to yourself
echo "Test OTP: 123456" | mail -s "Test" user@yourdomain.com
```

## 📱 Will This Work on Google/Groww?

**Honest answer: It depends on your server's IP reputation.**

| Site | Works? | Notes |
|------|--------|-------|
| Most SaaS apps | ✅ Yes | Works immediately |
| Forums, blogs | ✅ Yes | Works immediately |
| Smaller fintech apps | ✅ Yes | Usually works |
| Groww | ⚠️ Maybe | Depends on IP reputation; might need clean IP |
| Google | ❌ Hard | Google blocks IPs with no reputation; need aged IP |
| Banks | ❌ No | Use dedicated KYC-compliant email providers |

### Tips for Better Deliverability:
1. **Use a clean VPS IP** — Hetzner, DigitalOcean, Vultr (not shared hosting)
2. **Don't use the same IP as spam** — Dedicated IP for mail only
3. **Set up SPF + DKIM** — Shows legitimacy
4. **Warm up the IP** — Start by sending/receiving a few emails per day
5. **Use a reputable TLD** — `.com`, `.io`, `.co` (not `.xyz`, `.top`)

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SMTP_PORT` | `25` | SMTP listening port (25 needs root) |
| `API_PORT` | `3001` | Internal HTTP API port |
| `DB_PATH` | `./data/emails.db` | SQLite database path |
| `ALLOWED_DOMAINS` | `tempver.com` | Comma-separated list of domains to accept |
| `NEXT_PUBLIC_SMTP_API_URL` | `http://localhost:3001` | SMTP server API URL for Next.js |

## 📁 Project Structure

```
tempmail/
├── src/
│   ├── app/                # Next.js app router
│   │   ├── page.tsx        # Main page
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Global styles
│   │   └── api/            # API routes (proxy to SMTP server)
│   ├── components/         # React components
│   │   ├── Hero.tsx        # Landing hero section
│   │   ├── EmailGenerator.tsx  # ⭐ Core email management
│   │   ├── Features.tsx    # Feature cards
│   │   ├── HowItWorks.tsx  # Step-by-step guide
│   │   ├── Pricing.tsx     # Pricing tiers
│   │   ├── FAQ.tsx         # Accordion FAQ
│   │   └── ...
│   └── lib/
│       ├── email-service.ts    # Self-hosted SMTP API client
│       ├── guerrilla-api.ts    # Fallback: Guerrilla Mail
│       └── mailtm-api.ts       # API wrapper
├── smtp-server/
│   └── server.js           # ⭐ SMTP mail server + HTTP API
├── docker/
│   ├── Dockerfile.smtp     # SMTP server container
│   └── Dockerfile.web      # Next.js container
├── docker-compose.yml      # One-click deployment
└── README.md               # This file
```

## 💰 Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| VPS (Hetzner CX22) | ~$4/mo | 2 vCPU, 4GB RAM, clean IP |
| Domain | ~$10/year | Use .com or .io |
| Total | **~$50/year** | Running your own temp email service |

## 🔄 Two Modes

### Mode 1: Self-Hosted (Production)
- Deploy Docker containers on a VPS
- Configure DNS with your custom domain
- Emails are received by YOUR SMTP server
- Works for most websites (deliverability depends on IP)
- Full control over everything

### Mode 2: Guerrilla Mail Fallback (Development)
- No server needed
- Uses Guerrilla Mail's public API
- Good for testing the UI
- Won't work on Google, Groww, etc.
- Set `NEXT_PUBLIC_SMTP_API_URL` to empty to enable fallback

## 📝 License

MIT — Use it however you want.
