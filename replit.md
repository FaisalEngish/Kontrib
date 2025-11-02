# Kontrib - Financial Group Management System

## Overview
Kontrib is a full-stack web application for managing group financial contributions in Nigeria. It enables administrators to create contribution groups and projects, while members can join and make secure payments. The platform aims to provide transparent tracking, secure transactions, and efficient communication, aspiring to be the leading solution for community and group contributions in Nigeria.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend uses React 18 with TypeScript and Vite, leveraging Shadcn/UI (based on Radix UI) and Tailwind CSS. It features a custom Nigerian-themed color palette and a mobile-first design, including dynamic Open Graph meta tags for social sharing.

### Technical Implementations
- **Frontend**: Utilizes React Query for state management, Wouter for routing, and React Hook Form with Zod for form validation. Client-side authentication is handled via `localStorage`.
- **Backend**: Built with Node.js and Express.js, featuring Drizzle ORM for type-safe database operations and Zod for shared validation schemas.
- **Authentication**: SMS-based OTP-only authentication system with role-based access control (Admin/Member) and global phone number validation.
- **Payment Processing**: Members upload proof of payment for admin approval; the system tracks transactions, progress, and payment history.

### Feature Specifications
- **Group Management**: Admins can create groups with custom URLs, generate registration links, and manage group statuses.
- **Hierarchical Project Management**: Financial goals, target amounts, and deadlines are managed at the project level within groups.
- **WhatsApp Integration**: Generates professional sharing messages and dynamic Open Graph meta tags.
- **Dashboard System**: Separate dashboards for Admins (group management, analytics) and Members (contributions, payment history).
- **Role-Based Navigation**: Navigation menus adapt based on user roles.
- **Project Contribution Transparency**: Members can view detailed contributor lists for any project, showing all confirmed contributions sorted by amount, total contributions, and remaining balance. Accessible via "View Contributors" button on project cards.

### System Design Choices
- **Database**: PostgreSQL with Drizzle ORM for a relational schema (Users, Groups, Members, Contributions, OTPs).
- **Modularity**: Designed for scalability and maintainability of frontend and backend components.
- **Environment Configuration**: Supports development and production environments using environment variables.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL driver.
- **drizzle-orm**: Type-safe ORM.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/...**: Accessible UI component primitives.
- **wouter**: Lightweight React router.
- **PostgreSQL**: Primary database.
- **Drizzle Kit**: Database migration and schema management.
- **TypeScript**: Static type checking.
- **Vite**: Build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework.
- **canvas**: Node.js Canvas API for dynamic image generation.