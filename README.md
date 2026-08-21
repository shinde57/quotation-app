# Software Quotation Management System

A production-ready, full-stack web application for creating, managing, and printing professional software quotations. Built with Next.js, Tailwind CSS, and Supabase.

## Overview

This application provides an authenticated experience where users can securely manage their business quotations. It features real-time financial calculations, a responsive modern UI, Row Level Security (RLS) for data privacy, and a professional invoice-like view for printing or saving as PDF.

## Features

- **Secure Authentication**: Register and login using Supabase Auth.
- **Quotation Management**: Create, view, list, and delete quotations.
- **Dynamic Products**: Add multiple products/services to a single quotation with individual quantities, unit prices, and discounts.
- **Automatic Calculations**: Instantly calculates gross amounts, net amounts, subtotal, 18% GST, and grand total without floating-point errors.
- **Professional Invoice View**: A sleek, print-ready detail page designed like a real company invoice.
- **Data Privacy**: Supabase Row Level Security ensures users can only access their own data.
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop viewports using Tailwind CSS.

## Technology Stack

- **Frontend**: [Next.js](https://nextjs.org/) (Pages Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth

## Project Structure

```
.
├── src/
│   ├── layouts/         # Shared layouts (AuthGuard, MainLayout)
│   ├── lib/             # Supabase client configuration
│   ├── pages/           # Next.js routes (Auth, Dashboard, Create, View)
│   ├── styles/          # Global Tailwind CSS
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Pure functions for calculations and validation
├── db/
│   └── init.sql         # Database schema and RLS policies
├── public/              # Static assets
└── tailwind.config.js   # Tailwind configuration
```

## Supabase Setup

1. **Create a Supabase Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2. **Execute Database Schema**: 
   - Navigate to the **SQL Editor** in your Supabase dashboard.
   - Copy the contents of `db/init.sql`.
   - Run the script to create the `quotations` and `quotation_items` tables, enable Row Level Security, and set up policies.
3. **Configure Authentication**: Authentication is handled by default via email/password. No extra setup required unless you want to disable email confirmations (useful for testing).

If the database was created before GST selection or quotation statuses were added, run `db/upgrade_quotations_status.sql` in the Supabase SQL Editor. It adds the missing `status` column, backfills existing rows, enforces the supported values, and reloads the PostgREST schema cache.

## Installation & Running Locally

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file by copying the example:
   ```bash
   cp .env.local.example .env.local
   ```

3. Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to a GitHub repository.
2. Go to Vercel and import the repository.
3. Add the following Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically build and deploy the Next.js application.

## Test Credentials

(Add your test credentials here after deploying so reviewers can easily test the app)

- **Email**: `test@example.com`
- **Password**: `password123`
