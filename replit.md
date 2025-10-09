# Kontrib - Financial Group Management System

## Overview
Kontrib is a full-stack web application designed for managing group financial contributions in Nigeria. It allows administrators to create contribution groups and members to join and make payments. The platform aims to streamline group financial contributions, featuring modern UI/UX, robust backend services, and a focus on user-friendly payment and group management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Frontend**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **UI Framework**: Shadcn/UI built on Radix UI.
- **Styling**: Tailwind CSS with a custom Nigerian-themed color palette (green primary colors).
- **State Management**: React Query (TanStack Query) for server state.
- **Routing**: Wouter for client-side routing.
- **Forms**: React Hook Form with Zod validation.
- **Authentication**: Client-side authentication state management with localStorage.

### Technical Implementations
- **Backend**: Node.js with Express.js following a RESTful API pattern.
- **Database ORM**: Drizzle ORM for type-safe database operations.
- **Validation**: Zod schemas shared between client and server.
- **Authentication System**: OTP-only (SMS-based) authentication, role-based access control (Admin vs. Member), and client-side session persistence.
- **Group Management**:
    - Custom URL generation (e.g., `kontrib.app/groupname`).
    - Enhanced WhatsApp integration for sharing.
    - Unique registration links for member self-registration.
    - Group and Project status tracking (active, completed, paused).
    - Hierarchical project management with financial data (targets, amounts, deadlines) moved to project level.
- **Payment Processing**:
    - Proof of payment upload with admin approval.
    - Transaction reference support.
    - Payment history and real-time progress tracking.
- **Dashboard System**: Separate dashboards for Admins (group management, analytics) and Members (joined groups, payment history).
- **Deployment Strategy**: Designed for multi-platform support (Replit for development, Render.com for production) with dynamic port binding and optimized build processes.

### System Design Choices
- **Database**: PostgreSQL with a relational schema including Users, Groups, Group Members, Contributions, and OTP Verifications.
- **Data Flow**: Defined flows for authentication, group creation, group joining, and payment processing.
- **Modularity**: Modular architecture for scalability and maintenance.

## External Dependencies
- **Database**: PostgreSQL (configured for Neon Database).
- **ORM**: `@neondatabase/serverless`, `drizzle-orm`, `Drizzle Kit`.
- **Frontend Libraries**: `@tanstack/react-query`, `@radix-ui/*`, `wouter`.
- **Development Tools**: TypeScript, Vite, Tailwind CSS, ESBuild.
- **Messaging**: WhatsApp (for group sharing and invitations).