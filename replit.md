# Kara Sancak Birliği (KSB) - Tactical Communication Platform

## Overview

This is a real-time tactical communication platform built as a mobile-first web application. The project functions as a secure messaging system with military/operations-themed UI, featuring group chat, direct messaging, friend management, user authentication, and an intelligence links panel. The application uses Turkish language throughout the interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, local component state for UI
- **Styling**: Tailwind CSS with custom dark theme (black/white/green accent colors)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for transitions and splash screen effects
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared routes file with Zod validation schemas
- **Session Management**: Express-session with MemoryStore (development) / connect-pg-simple (production ready)

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - defines users, messages, friends, and intel_links tables
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Connection**: Node-postgres (pg) pool connection via DATABASE_URL environment variable

### Data Models
- **Users**: Authentication, profiles, admin/ban flags, verification status
- **Messages**: Group and DM support, media attachments (image/video/audio), reply threading
- **Friends**: Friend request system with pending/accepted status
- **Intel Links**: Categorized external resource links for the intel panel

### API Structure
All API endpoints are defined in `shared/routes.ts` with:
- Path definitions
- HTTP methods
- Input validation schemas (Zod)
- Response type schemas

Key endpoint groups:
- `/api/auth/*` - Registration, login, logout
- `/api/users/*` - Profile management, user search
- `/api/messages/*` - CRUD operations for messages
- `/api/friends/*` - Friend requests and management

### Build System
- **Development**: Vite dev server with Express backend integration
- **Production**: Custom esbuild script bundles server, Vite builds client to `dist/public`
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for static assets

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication & Sessions
- **express-session**: Server-side session management
- **memorystore**: In-memory session store for development
- **connect-pg-simple**: PostgreSQL session store (available for production)

### Frontend Services
- **Firebase Realtime Database**: Configured in `client/src/lib/firebase.ts` (appears set up for potential real-time features, uses `VITE_FIREBASE_DATABASE_URL`)

### UI/UX Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Framer Motion**: Animation library for splash screen and transitions
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities
- **embla-carousel-react**: Carousel component

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner (development only)