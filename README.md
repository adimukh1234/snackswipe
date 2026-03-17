# CRAVE - Tinder for Food Ordering

A swipe-based food discovery and ordering platform built as a PWA.

## 🏗️ Project Structure

```
crave/
├── apps/
│   ├── web/          # Next.js PWA (Consumer + Partner Dashboard)
│   └── api/          # Fastify API Server
├── packages/
│   ├── database/     # Drizzle ORM schemas & migrations
│   ├── shared/       # Shared types & utilities
│   └── ui/           # Shared UI components
└── package.json      # Workspace root
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Web app: http://localhost:3000
# API: http://localhost:4000
```

## 📦 Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion
- **Backend**: Fastify, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Cache**: Redis (Upstash)
- **Media**: Cloudflare R2
- **Payments**: Razorpay
- **Delivery**: Porter API

## 📱 Features

- Swipe-based dish discovery
- Video-first content
- Smart recommendations
- Multi-restaurant cart
- Real-time order tracking
- Partner dashboard
