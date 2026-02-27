# AGENTS.md - Developer Guide for Gloria

## Project Overview

Gloria is a Next.js 15 application with React 19 that visualizes historical events on an interactive map using React-Leaflet. It uses the App Router, Tailwind CSS v4, and shadcn/ui-style components built on Radix UI primitives.

---

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Linting
```bash
npm run lint         # Run ESLint on src/ and app/ directories
```

### Testing
- **No tests are currently configured** - The project has no test files (.test.js, .spec.js, etc.)
- To add tests, install Jest with `npm install --save-dev jest @testing-library/react` or Vitest
- Run tests: `npm test` (Jest) or `npx vitest` (Vitest)
- Run a single test: `npm test -- --testPathPattern=<pattern>` or `npx vitest run --grep "<pattern>"`

---

## Code Style Guidelines

### Language
- **JavaScript** (not TypeScript) - All files use `.js`, `.jsx` extensions
- React 19 with Next.js 15 App Router

### Imports
- Use absolute imports with `@/` prefix (configured in `jsconfig.json`)
- Example: `import { cn } from "@/lib/utils"` or `import Button from "@/components/ui/button"`
- Group imports: React/Next built-ins first, then third-party, then local

### Formatting
- This project uses **Tailwind CSS v4** (no separate tailwind.config.js - uses CSS variables)
- Global styles in `src/app/globals.css`
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Format: 2-space indentation

### Naming Conventions
- **Components**: PascalCase (e.g., `EventCard`, `MapViewer`)
- **Hooks**: camelCase with "use" prefix (e.g., `useMediaQuery`)
- **Utilities**: camelCase (e.g., `cn`, `formatDate`)
- **Files**: kebab-case for utilities (e.g., `utils.js`), PascalCase for components (e.g., `Button.jsx`)

### Component Structure
- Use shadcn/ui style: separate UI components in `src/components/ui/`
- Reusable components go in `src/components/`
- Use Radix UI primitives via `@radix-ui/react-*` packages
- Follow this pattern for UI components:
```jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const ComponentName = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("base-classes", className)} {...props} />
))
ComponentName.displayName = "ComponentName"

export { ComponentName }
```

### Error Handling
- Use try/catch for async operations (API routes, database operations)
- Handle errors gracefully in UI with user-friendly messages
- Log errors appropriately for debugging

### API Routes
- Located in `src/app/api/`
- Use Next.js Route Handlers with proper HTTP method handling
- MongoDB/Mongoose connection in API routes
- Always validate request body with try/catch and return appropriate status codes

### Environment Variables
- Create `.env.local` for local development (never commit this file)
- Use `process.env.VARIABLE_NAME` to access env vars
- Required variables typically include database connection strings

### Database Patterns
- Mongoose models in `src/app/models/`
- Always close database connections properly
- Use connection pooling for MongoDB
- Handle connection errors gracefully

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── mapDb/        # Database API
│   │   └── axios.js      # Axios instance config
│   ├── components/        # Page-specific components
│   ├── lib/              # Library code (utils, hooks)
│   ├── models/           # Mongoose models
│   └── themes/           # Theme configuration
├── components/
│   └── ui/               # Reusable UI components (shadcn style)
└── lib/
    ├── utils.js          # cn() utility
    └── use-media-query.js # Custom hook
```

---

## Configuration Files

- `components.json` - shadcn/ui configuration
- `eslint.config.mjs` - ESLint config (extends next/core-web-vitals)
- `next.config.mjs` - Next.js configuration
- `tailwind.config` - Not present (v4 uses CSS variables)
- `jsconfig.json` - Path aliases

---

## Key Dependencies

- **UI**: @radix-ui/react-* (dialog, dropdown-menu, select, slider, slot, tooltip)
- **Styling**: Tailwind CSS v4, tailwind-merge, clsx, class-variance-authority
- **Icons**: lucide-react
- **Maps**: react-leaflet, react-leaflet-markercluster, leaflet
- **Data**: mongoose, axios
- **Framework**: Next.js 15, React 19

---

## Common Patterns

### Conditional Classes
```javascript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  className  // allow override
)} />
```

### Client Components
```javascript
"use client"

import { useState } from "react"

export function ClientComponent() {
  const [state, setState] = useState()
  // ...
}
```

---

## Notes

- This is a migration from a Vite/React project (see README.md references to Vite)
- The project uses MUI Lab (@mui/lab) but it's not actively used in current code
- Some commented code may exist from migration - clean up when working on related features
- Use `framer-motion` for animations, `@react-three/fiber` for 3D elements
- React-window is used for virtualizing long lists
