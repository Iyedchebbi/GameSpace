# Coding Standards & Best Practices

## Project: Gameness

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: InsForge (PostgreSQL, Auth, Storage, AI, Functions)
- **Styling**: Tailwind CSS 3.4 (DO NOT upgrade to v4)

## InsForge Configuration
- **Backend URL**: `https://m3pm4j3c.eu-central.insforge.app`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDU4MDZ9.zajtNVP4d9PSZ5IcCogZN3A74e945lgWshl1Kgl3hww`

### Environment Variables
Create `.env` file:
```env
VITE_INSFORGE_URL=https://m3pm4j3c.eu-central.insforge.app
VITE_INSFORGE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDU4MDZ9.zajtNVP4d9PSZ5IcCogZN3A74e945lgWshl1Kgl3hww
```

### Available AI Models
- `deepseek/deepseek-v3.2`
- `minimax/minimax-m2.1`
- `x-ai/grok-4.1-fast`
- `anthropic/claude-sonnet-4.5`
- `openai/gpt-4o-mini`
- `google/gemini-3-pro-image-preview`

### Auth Settings
- OAuth: GitHub, Google
- Email verification required
- Password min length: 6

---

## General Principles

### 1. TypeScript Strict Mode
- Always use explicit types; avoid `any`
- Enable strict null checks
- Use interfaces over types for object shapes

### 2. InsForge SDK Usage
- Always use SDK methods for application logic (auth, db, storage, ai, functions)
- Use MCP tools only for infrastructure (schema, buckets, deployments)
- Always handle `{data, error}` responses properly

### 3. File Organization
```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── lib/            # SDK client, utilities
├── hooks/          # Custom React hooks
├── types/          # TypeScript interfaces
└── assets/         # Static assets
```

---

## Database (InsForge DB SDK)

### Queries
```typescript
// Always use proper typing
const { data, error } = await client
  .from('table_name')
  .select('*, relation!inner(*)')
  .eq('column', 'value')
  .order('created_at', { ascending: false });

if (error) throw error;
return data;
```

### Inserts
- Always pass array format: `client.from('table').insert([{...}])`
- Use returning to get inserted data
- Validate data before insert

### Real-time Subscriptions
```typescript
const channel = client
  .channel('table_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'table_name' }, 
    (payload) => { /* handle */ }
  )
  .subscribe();
```

---

## Authentication

### Client Setup
```typescript
import { createClient } from '@insforge/sdk';

export const client = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### Auth Flows
- Use `client.auth.signUp()`, `client.auth.signInWithPassword()`, `client.auth.signOut()`
- Check `client.auth.getSession()` for authenticated state
- Protect routes with auth guards

---

## Storage

### Upload Pattern
```typescript
const { data, error } = await client.storage
  .from('bucket_name')
  .upload(`${userId}/${fileName}`, file);

if (error) throw error;
// Store returned path in database
```

### Get Public URL
```typescript
const { data: { publicUrl } } = client.storage
  .from('bucket_name')
  .getPublicUrl(filePath);
```

---

## AI Integration

### Chat Completions
```typescript
const { data, error } = await client.ai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'prompt' }],
});

if (error) throw error;
return data.choices[0].message.content;
```

---

## React Components

### Component Structure
```typescript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  // Hooks first
  const [loading, setLoading] = useState(false);
  
  // Early returns
  if (!isReady) return <Skeleton />;
  
  // Render
  return (
    <div className="component">
      <h1>{title}</h1>
    </div>
  );
}
```

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types/Interfaces: PascalCase (`User.ts`)

### Tailwind Classes
- Use consistent spacing (4px base: `p-4`, `m-4`)
- Group related classes
- Use semantic colors from design system
- Responsive: `md:`, `lg:` prefixes

---

## Error Handling

### Pattern
```typescript
try {
  const { data, error } = await operation();
  if (error) {
    toast.error(error.message);
    return;
  }
  // success
} catch (err) {
  console.error(err);
  toast.error('An unexpected error occurred');
}
```

### User Feedback
- Always show loading states during async operations
- Display clear error messages to users
- Use toast notifications for transient feedback

---

## Performance

### Optimizations
- Use React.memo for expensive components
- Implement useMemo/useCallback for derived values
- Lazy load routes: `const Page = lazy(() => import('./Page'))`
- Use proper image sizing (srcset, lazy loading)

### InsForge Specific
- Select only needed columns: `.select('id, name')`
- Use pagination for large datasets
- Batch operations when possible

---

## Security

### Never Do
- Never commit secrets to git
- Never expose admin keys in frontend code
- Never trust client-side validation alone
- Never store sensitive data in localStorage

### Always Do
- Use environment variables for secrets
- Validate data on both client and server (via edge functions)
- Use RLS policies for data access control
- Sanitize user inputs

---

## Testing

### Unit Tests
- Test utility functions in isolation
- Test custom hooks with renderHook
- Mock InsForge client for component tests

### Integration Tests
- Test user flows end-to-end
- Verify error states are handled

---

## Git Conventions

### Commits
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Keep commits atomic and focused
- Write clear, concise messages

### Branching
- `main` - production code
- `develop` - integration branch
- `feature/description` - new features
- `fix/description` - bug fixes

---

## Code Review Checklist

- [ ] TypeScript types are explicit
- [ ] Error handling is present
- [ ] Loading states implemented
- [ ] No console.log in production
- [ ] Environment variables used for secrets
- [ ] Tailwind classes are consistent
- [ ] Components are properly named
- [ ] No hardcoded values that should be configurable
