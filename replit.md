# Birthday Manager Application

## Overview

This is a full-stack web application for managing birthdays and important dates. It's built with a modern tech stack featuring React with TypeScript on the frontend, Express.js on the backend, and uses Drizzle ORM with PostgreSQL for data persistence. The application provides a beautiful, interactive interface for tracking birthdays with visual timelines, statistics, and CRUD operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 31, 2025 - Bug Fixes
- Fixed JSX syntax error in family-tree.tsx component (SVG element structure)
- Removed missing tooltip import from App.tsx 
- Created missing not-found page component
- Application now runs successfully without build errors

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React 18 with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build System**: Vite for frontend, esbuild for backend

## Key Components

### Frontend Architecture
- **Component Library**: Uses shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Data Layer**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between client and server
- **Development**: Hot reload with Vite integration in development mode

### Database Schema
The application uses a simple `people` table with the following structure:
- `id`: UUID primary key (auto-generated)
- `firstName`: Text, required
- `lastName`: Text, required
- `month`: Text, optional (month name)
- `day`: Integer, optional (day of month)
- `year`: Integer, optional (birth year)

### Key Features
1. **Birthday Timeline**: Visual monthly timeline showing birthday distribution
2. **Birthday Cards**: Individual cards for each person with days until birthday
3. **Statistics Dashboard**: Shows total people, current month birthdays, upcoming birthdays, and today's birthdays
4. **CRUD Operations**: Create, read, update, and delete people
5. **Search and Filter**: Search by name and filter by month
6. **CSV Export**: Download birthday data as CSV

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data
2. **API Routes**: Express.js routes handle HTTP requests
3. **Data Access**: Currently uses in-memory storage (MemStorage class) with seeded data
4. **Validation**: Zod schemas validate data on both client and server
5. **Response**: JSON responses sent back to client
6. **UI Updates**: TanStack Query automatically updates UI when data changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing library
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: CSS class variants
- **clsx**: Conditional classnames utility

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: JavaScript bundler for production

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for frontend
- Express server with automatic restarts via tsx
- Database migrations handled by Drizzle Kit

### Production Build
1. Frontend built with Vite to `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Static files served by Express in production
4. Database schema pushed using `drizzle-kit push`

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment setting (development/production)
- Supports Replit-specific configurations and plugins

### Key Architectural Decisions

1. **Monorepo Structure**: Keeps related code together while maintaining clear boundaries
2. **Shared Schema**: Zod schemas in `/shared` ensure type safety across client/server boundary
3. **Memory Storage Fallback**: MemStorage class provides development experience without database setup
4. **Component-First UI**: Uses proven shadcn/ui pattern for consistent, accessible components
5. **Type Safety**: Full TypeScript coverage with shared types between frontend and backend
6. **Modern Build Tools**: Vite and esbuild for fast development and optimized production builds