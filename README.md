# IKIGAI - Maharashtra Virtual Museum Experience

A Next.js web application showcasing Maharashtra's rich history, iconic museums, exhibits, and audio guides.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: Tailwind CSS, Custom CSS animations
- **Backend / Auth**: Supabase
- **Smooth Scroll**: Lenis

## Getting Started

First, install dependencies:

```bash
npm install
```

Set up your `.env.local` environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the virtual museum.

## Project Structure

```text
├── public/               # Static assets & fonts
│   ├── Assets/           # Images, SVGs, and illustrations
│   └── fonts/            # Custom web fonts
├── src/
│   ├── app/              # Next.js App Router pages, layout, and auth routes
│   ├── components/       # UI sections & interactive components
│   ├── lib/              # Utility functions & Supabase clients
│   └── archive/          # Archived reference components
├── .env.local            # Environment variables (git-ignored)
├── .gitignore            # Git ignore configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project metadata & dependencies
└── tsconfig.json         # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run start` - Runs the built production application.
- `npm run lint` - Runs ESLint to check for code issues.