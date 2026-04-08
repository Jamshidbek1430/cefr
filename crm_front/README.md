# EduCRM – Modern Educational Center CRM & LMS

EduCRM is a premium, all-in-one Management System for educational centers, featuring role-based dashboards, real-time communication, and AI-powered learning tools. Built with a unified design language and cutting-edge technologies.

## 🚀 Key Features

- **Role-Based Dashboards**: Tailored experiences for Super Admins, Branch Admins, Teachers, and Students.
- **AI Academic Suite**:
    - **AI Training Hub**: Multiple practice modes (Quiz, Speaking, Writing) with real-time feedback.
    - **Global AI Helper**: Floating academic assistant available across all views.
- **Real-Time Communication**: Isolated group chats and direct messaging using Socket.io.
- **Academic Lifecycle**: Comprehensive homework management (Assign -> Submit -> Grade) and attendance tracking.
- **Executive Reporting**: Tiptap-based professional documentation engine with SSR-stability.
- **Premium UI/UX**: Unified glassmorphism design with standard-setting animations.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **Database**: Prisma ORM (supports Postgres, MySQL, SQLite)
- **Auth**: NextAuth.js
- **Real-time**: Socket.io
- **Icons**: Lucide-React
- **AI**: OpenAI integration (optional)

## 📦 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Asat1llo/crm.git
   cd crm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example template and fill in your secrets:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Ensure `NEXTAUTH_SECRET` and `DATABASE_URL` are set.*

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed initial data
   npx prisma db seed
   ```

5. **Run Locally**:
   ```bash
   npm run dev
   ```

## ☁️ Vercel Deployment

1. Connect this GitHub repository to your Vercel project.
2. Add all environment variables from `.env.local` to the Vercel Dashboard.
3. Vercel will automatically detect the Next.js project and deploy it.

---
Built by [Asat1llo](https://github.com/Asat1llo) with Antigravity AI.
