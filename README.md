# 🤖 AI Email Assistant

A production-ready AI-powered email assistant web application that intelligently manages Gmail inboxes through automatic email summarization, smart categorization, thread consolidation, AI-generated replies, and scheduled digest notifications.

![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Features
- 🔐 **Gmail OAuth 2.0 Integration** - Secure authentication with full Gmail API access
- 🤖 **AI-Powered Email Summarization** - Claude/GPT-4o converts emails into concise one-line summaries
- 📊 **Smart Categorization** - Automatically classify emails (Important/Transactional/Promotional)
- 🔗 **Thread Consolidation** - Group emails from same sender with unified summary
- ✍️ **AI Reply Generation** - Context-aware email draft responses with customizable tone
- 📬 **Scheduled Digests** - Customizable notification schedules (1-4x daily)
- 🔔 **Category-based Notifications** - Toggle notifications per category
- 🔍 **Advanced Search & Filters** - Fast email search with powerful filtering
- 🌐 **Multi-language Support** - English + Indonesian (easily extendable)
- 💳 **Subscription Management** - Free trial + Stripe-powered paid plans

### Technical Highlights
- ⚡ Processes 500-1,000 emails per user per day
- 🚀 Response time: <2 seconds for inbox load
- 🎯 AI processing: <5 seconds per email batch
- 📈 Supports 1,000+ concurrent users
- 🔒 GDPR compliant with data encryption
- 🛡️ Rate limiting and security middleware
- 📊 Comprehensive logging and monitoring

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 15.0.3 (App Router)
- TypeScript 5.6+
- Tailwind CSS 3.4+
- shadcn/ui components
- TanStack Query (React Query)
- Zustand for state management

**Backend:**
- Node.js 20 LTS
- Next.js API Routes
- Sequelize 6.35+ ORM
- PostgreSQL 16+
- NextAuth.js v5 (Auth.js)

**AI & External Services:**
- Anthropic Claude API (claude-3-5-sonnet-20241022)
- OpenAI GPT-4o (fallback)
- Gmail API (googleapis)

**Background Jobs & Caching:**
- BullMQ 5.0+ with Redis 7+
- Upstash Redis (serverless)

**Payments:**
- Stripe for subscriptions

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+
- Redis 7+
- Gmail API credentials
- Anthropic/OpenAI API keys
- Stripe account (for subscriptions)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/rochiyat-bit/ai-email-assistent.git
cd ai-email-assistent
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/email_assistant"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# Google OAuth & Gmail API
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Providers
ANTHROPIC_API_KEY="sk-ant-xxxxx"
OPENAI_API_KEY="sk-xxxxx"  # Optional fallback

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxxx"

# Stripe (Optional for testing)
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
```

4. **Set up the database**

```bash
# Run migrations
npm run db:migrate

# Optional: Seed demo data
npm run db:seed
```

5. **Start the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Using Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

## 📁 Project Structure

```
ai-email-assistant/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth-related pages
│   ├── (dashboard)/            # Dashboard pages
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── emails/            # Email management
│   │   ├── ai/                # AI features
│   │   └── user/              # User preferences
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/                 # React components
│   ├── inbox/                 # Email inbox components
│   ├── dashboard/             # Dashboard components
│   ├── settings/              # Settings components
│   └── ui/                    # shadcn/ui components
├── lib/                       # Core libraries
│   ├── gmail/                 # Gmail API client
│   ├── ai/                    # AI service integration
│   ├── jobs/                  # Background jobs
│   ├── utils/                 # Utility functions
│   ├── auth.ts                # NextAuth configuration
│   └── sequelize.ts           # Database connection
├── models/                    # Sequelize models
│   ├── User.ts
│   ├── ProcessedEmail.ts
│   ├── EmailThread.ts
│   ├── AIUsageLog.ts
│   ├── NotificationLog.ts
│   ├── DraftReply.ts
│   └── SyncJob.ts
├── migrations/                # Database migrations
├── config/                    # Configuration files
├── public/                    # Static assets
└── tests/                     # Test files
```

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and Gmail credentials
- **processed_emails** - Individual emails with AI summaries
- **email_threads** - Consolidated email threads
- **ai_usage_logs** - AI API usage tracking
- **notification_logs** - Digest notification history
- **draft_replies** - AI-generated draft responses
- **sync_jobs** - Email sync job tracking

See [models/](./models) for detailed schema definitions.

## 🔧 Configuration

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### AI Provider Setup

**Anthropic Claude (Recommended):**
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`

**OpenAI (Fallback):**
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env.local` as `OPENAI_API_KEY`

### Redis Setup

**Option 1: Local Redis**
```bash
# Install and start Redis
brew install redis  # macOS
redis-server
```

**Option 2: Upstash (Recommended for production)**
1. Sign up at [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy credentials to `.env.local`

## 🎯 Key Features Implementation

### Email Synchronization

Emails are synced using BullMQ background jobs:

```typescript
// Trigger email sync
await scheduleEmailSync(userId, 'incremental');
```

The sync job:
1. Fetches emails from Gmail API
2. Processes each email with AI for summarization and categorization
3. Saves to database
4. Updates email threads
5. Sends notifications if configured

### AI Email Processing

The AI service supports multiple providers:

```typescript
const aiService = new AIService('anthropic', userId);
const result = await aiService.summarizeEmail({
  subject: email.subject,
  from: email.from,
  snippet: email.snippet,
  body: email.body,
});
```

Returns:
- One-line summary (max 100 chars)
- Category (important/transactional/promotional)
- Confidence score (0-1)
- Token usage for cost tracking

### Authentication Flow

1. User clicks "Connect Gmail"
2. Redirected to Google OAuth consent screen
3. User grants Gmail permissions
4. Callback creates/updates user in database
5. Access + refresh tokens securely stored (encrypted)
6. User redirected to dashboard

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**

```bash
npm i -g vercel
vercel
```

3. **Configure Environment Variables**

Add all environment variables in Vercel dashboard.

4. **Set up Database**

Use [Supabase](https://supabase.com/) or [Neon](https://neon.tech/) for PostgreSQL.

5. **Set up Redis**

Use [Upstash](https://upstash.com/) for serverless Redis.

### Environment Variables in Production

Ensure all production environment variables are set:
- Database connection string
- NextAuth secret (generate new one)
- Google OAuth credentials
- AI API keys
- Redis connection
- Stripe keys

## 🔒 Security

- ✅ Gmail tokens encrypted at rest
- ✅ Rate limiting on all API endpoints
- ✅ CSRF protection via NextAuth
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ XSS protection (React + Next.js)
- ✅ Security headers configured
- ✅ GDPR compliant data handling

## 📈 Performance Optimization

- Database indexes on frequently queried fields
- Redis caching for inbox data (5-minute TTL)
- Cursor-based pagination for large datasets
- AI batch processing (10 emails at a time)
- Background jobs for heavy operations
- Optimistic UI updates

## 🐛 Troubleshooting

**Database Connection Issues:**
```bash
# Test database connection
npm run db:migrate
```

**Gmail API Errors:**
- Verify OAuth credentials
- Check redirect URIs match exactly
- Ensure Gmail API is enabled in Google Cloud

**AI Processing Failures:**
- Check API key validity
- Verify rate limits not exceeded
- Review logs in `logs/error.log`

**Redis Connection:**
```bash
# Test Redis connection
redis-cli ping
```

## 📝 API Documentation

### Email Endpoints

**GET /api/emails/inbox**
- Get paginated inbox emails
- Query params: `page`, `limit`, `category`, `search`

**POST /api/emails/sync**
- Trigger email synchronization
- Body: `{ sync_type: 'full' | 'incremental' }`

**GET /api/emails/:id**
- Get single email with full content

**PUT /api/emails/:id/category**
- Update email category
- Body: `{ category: 'important' | 'transactional' | 'promotional' }`

### AI Endpoints

**POST /api/ai/summarize**
- Generate email summary
- Body: `{ email_ids: string[] }` or `{ thread_id: string }`

**POST /api/ai/reply**
- Generate AI reply
- Body: `{ email_id: string, tone: string, language: string }`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Anthropic](https://www.anthropic.com/) - Claude AI
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Hosting platform

## 📞 Support

For support, email support@yourdomain.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Outlook/Exchange support
- [ ] Advanced AI training on user preferences
- [ ] Email scheduling and send later
- [ ] Team collaboration features
- [ ] Integration with calendar and tasks
- [ ] More AI providers (Gemini, Llama)
- [ ] Advanced analytics dashboard

## ⚡ Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set up PostgreSQL database
- [ ] Configure Google OAuth credentials
- [ ] Add AI API keys (Anthropic/OpenAI)
- [ ] Run database migrations
- [ ] Start development server
- [ ] Connect Gmail account
- [ ] Test email synchronization

---

**Built with ❤️ for productivity enthusiasts**
