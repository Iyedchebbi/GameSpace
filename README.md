# GAMEZONE 🎮

A highly-performant, modern gaming frontend platform built on a cutting-edge web stack. This application serves as the storefront, user portal, and game metadata explorer for the GAMEZONE ecosystem.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.9+](https://www.typescriptlang.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animations**: [Framer Motion 11.x](https://www.framer.com/motion/)
- **Backend & Auth**: [InsForge](https://insforge.app/) (PostgreSQL, Auth, Storage, AI)
- **3D Experiences**: [Spline](https://spline.design/) (`@splinetool/react-spline`)

## ✨ Features

- **Blazing Fast Performance**: Leveraging Next.js 15 server-side rendering, React Server Components and fine-grained static generation.
- **Immersive 3D Elements**: Uses `@splinetool/react-spline` to bring interactive 3D elements natively into the frontend.
- **Robust Authentication**: Deep integration with InsForge for secure, session-managed access and role-based data.
- **Sleek UI/UX Context**: Highly animated, hardware-accelerated animations using Framer Motion combined with a bespoke dark-mode-first aesthetic (using Tailwind CSS glow effects and gradients).
- **Type-Safe Codebase**: Strict TypeScript rules eliminating `any` types for rock-solid stability.

## 🛠️ Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Iyedchebbi/GameSpace.git
   cd GAMEZONE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Duplicate the provided `.env.example` file to create a strictly local `.env.local` config. Supply your InsForge tokens:
   ```env
   NEXT_PUBLIC_INSFORGE_URL="your-insforge-url"
   NEXT_PUBLIC_INSFORGE_ANON_KEY="your-insforge-anon-key"
   ```

### Running Locally

Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🏗️ Architecture

The folder structure strictly adheres to the following:
- `src/app/`: Next.js App Router views, layouts, and page routing logic.
- `src/components/`: Reusable, atomic React components (`Header.tsx`, `Hero.tsx`).
- `src/lib/`: SDK wrappers, InsForge clients, and standalone utilities.
- `src/hooks/`: Reusable React Hooks focusing on React state and lifecycle (`useAuth.ts`, `useGames.ts`).
- `src/types/`: TypeScript strictly-typed interfaces and application models.

## 🤝 Code Guidelines

- **Atomic Commits**: Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **Security First**: Secrets are never pushed. RLS policies manage database permissions over the InsForge client.
- **Component Design**: Maintain isolated business logic inside custom hooks.

---
*Built iteratively, focused on performance and exceptional gaming experiences.*
