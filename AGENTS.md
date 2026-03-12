---
description: Instructions for building GAMEZONE Next.js app with InsForge
globs: *
alwaysApply: true
---

# GAMEZONE - Agent Coding Guidelines

## Build Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Note:** No test suite is configured. Do not add tests unless explicitly requested.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9+
- **UI**: React 19, Tailwind CSS 3.4 (DO NOT upgrade to v4)
- **Animations**: Framer Motion 11.x
- **Backend**: InsForge (PostgreSQL, Auth, Storage, AI)

## Code Style

### General Rules

- Use explicit types - never use `any`
- Enable strict null checks
- Use interfaces over types for object shapes
- Prefer `import { ... }` over `import * as ...`
- Use `async/await` over raw promises
- Avoid `var` - use `const` or `let`

### File Organization

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # Reusable UI components
├── lib/              # SDK client, utilities
├── hooks/            # Custom React hooks
├── types/            # TypeScript interfaces
└── assets/           # Static assets
```

### Naming Conventions

- Components: PascalCase (`Header.tsx`, `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`, `useCart.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types/Interfaces: PascalCase (`User.ts`, `Product.ts`)

### Imports Order (strict)

1. React/Next imports (`react`, `next/*`)
2. Third-party libraries (`framer-motion`, `lucide-react`)
3. Internal components/hooks (`@/components/*`, `@/hooks/*`)
4. Types/interfaces (`@/types/*`)
5. Relative paths (`../`, `./`)

### Component Structure

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export default function MyComponent({ title, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="component">
      <motion.div initial={{ opacity: 0 }}>
        {title}
      </motion.div>
    </div>
  );
}
```

### Tailwind CSS

- Use 4px base spacing (`p-4`, `m-4`, `gap-4`)
- Group related classes logically
- Responsive prefixes: `md:`, `lg:`, `xl:`
- Use `text-gradient` and `glow-text` custom classes from globals.css

### Error Handling

```typescript
// SDK returns {data, error} - always handle both
const { data, error } = await insforge.from('users').select('*');
if (error) {
  console.error('Failed to fetch users:', error.message);
  return;
}
```

---

# InsForge SDK

## Setup

```typescript
import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '',
});
```

## Environment Variables

```
NEXT_PUBLIC_INSFORGE_URL=https://m3pm4j3c.eu-central.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Available Models

- `deepseek/deepseek-v3.2`, `minimax/minimax-m2.1`, `x-ai/grok-4.1-fast`
- `anthropic/claude-sonnet-4.5`, `openai/gpt-4o-mini`, `google/gemini-3-pro-image-preview`

## SDK Patterns

- Auth: `signUp`, `signInWithPassword`, `signOut`
- Database: `.insert([{...}])`, `.select('id, name')`, `.eq()`, `.order()`
- Storage: `.from('bucket').upload()`, `.download()`
- AI: `chat.completions.create()`
- Important: inserts require array format, select only needed columns

---

# Security Guidelines

- NEVER commit secrets to git
- NEVER expose admin keys in frontend
- Use environment variables for all secrets
- Validate data on client AND server
- Use RLS policies for data access control

# Git Conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Branch naming: `feature/description`, `fix/description`
- Keep commits atomic and focused
