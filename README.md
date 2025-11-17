# Super Budget - Project Management Dashboard

A full-stack project management dashboard application built with NestJS and Next.js, featuring user authentication, project CRUD operations, filtering, search, and email notifications.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

### Start the Application

**On macOS/Linux:**
```bash
./start.sh
```

**On Windows:**
```batch
start.bat
```

**Manual start:**
```bash
docker-compose up -d --build
```

### Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001
- **pgAdmin**: http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

### Stop the Application

**On macOS/Linux:**
```bash
./stop.sh
```

**On Windows:**
```batch
stop.bat
```

**Manual stop:**
```bash
docker-compose down
```

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Development](#development)
- [Deployment](#deployment)

## ✨ Features

### Core Features
- ✅ User authentication (Signup/Signin) with JWT
- ✅ Project CRUD operations
- ✅ Project filtering by status
- ✅ Search functionality (by name or team member)
- ✅ Responsive design with Tailwind CSS
- ✅ Email notifications when team members are assigned

### Project Management
- Create, read, update, and delete projects
- Project fields:
  - Name
  - Status (Active, On Hold, Completed)
  - Deadline
  - Assigned Team Member (email address)
  - Budget

### User Interface
- Modern, responsive dashboard
- Modal forms for creating/editing projects
- Confirmation modal for deletions
- Real-time filtering and search
- Status badges with color coding

## 🛠 Technology Stack

### Frontend
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeScript 5.7.3** - Type safety
- **Prisma 6.19.0** - Next-generation ORM
- **PostgreSQL 15** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **pgAdmin 4** - Database management UI
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
super-budget/
├── backend/                 # NestJS backend application
│   ├── prisma/             # Prisma schema and migrations
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding script
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/           # User management
│   │   ├── projects/        # Project CRUD operations
│   │   ├── email/           # Email service
│   │   ├── prisma/          # Prisma service
│   │   └── main.ts          # Application entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                # Next.js frontend application
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # Dashboard page
│   │   ├── signup/          # Signup page
│   │   └── signin/          # Signin page
│   ├── components/          # React components
│   │   ├── ProjectsTable.tsx
│   │   ├── ProjectModal.tsx
│   │   └── DeleteConfirmModal.tsx
│   ├── lib/                 # Utilities
│   │   └── api.ts           # API client
│   ├── types/               # TypeScript types
│   └── package.json
│
├── docs/                    # Documentation
├── docker-compose.yml       # Docker Compose configuration
├── start.sh                 # Startup script (macOS/Linux)
├── start.bat                # Startup script (Windows)
└── README.md                # This file
```

## 🚀 Getting Started

### Option 1: Docker (Recommended)

1. **Start all services:**
   ```bash
   ./start.sh
   # or
   docker-compose up -d --build
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   ./stop.sh
   # or
   docker-compose down
   ```

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the server:**
   ```bash
   npm run start:dev
   ```

#### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8001
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔌 API Documentation

### Authentication Endpoints

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Project Endpoints

#### Get All Projects
```http
GET /projects?status=ACTIVE
Authorization: Bearer <token>
```

#### Get Single Project
```http
GET /projects/:id
Authorization: Bearer <token>
```

#### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "status": "ACTIVE",
  "deadline": "2024-12-31",
  "assignedTeamMember": "team@example.com",
  "budget": 50000
}
```

#### Update Project
```http
PATCH /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "budget": 55000
}
```

#### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer <token>
```

## 🔒 Security

### Authentication & Authorization
- **JWT-based authentication** - Secure token-based auth
- **Password hashing** - bcrypt with salt rounds (10)
- **Token expiration** - 7 days
- **Protected routes** - All project endpoints require authentication

### Data Validation
- **DTO validation** - Class-validator for request validation
- **Input sanitization** - Automatic with NestJS ValidationPipe
- **Type safety** - TypeScript throughout the application

### Security Headers
- **CORS configuration** - Restricted to frontend origin
- **Error handling** - No sensitive information in error messages

### Database Security
- **Parameterized queries** - Prisma ORM prevents SQL injection
- **Connection pooling** - Managed by Prisma
- **Environment variables** - Sensitive data in .env files

### Email Security
- **SMTP configuration** - Secure email sending
- **Email validation** - Validates email format before sending

## 🐳 Docker Architecture

### Services

1. **PostgreSQL** (port 5432)
   - Database for storing users and projects
   - Persistent volume for data

2. **Backend** (port 8001)
   - NestJS API server
   - Auto-runs migrations on startup
   - Hot-reload enabled for development

3. **Frontend** (port 3001)
   - Next.js application
   - Hot-reload enabled for development

4. **pgAdmin** (port 5050)
   - Database management UI
   - Access at http://localhost:5050

### Docker Compose Configuration

The `docker-compose.yml` file orchestrates all services:
- Shared network for service communication
- Volume mounts for hot-reload
- Health checks for service dependencies
- Environment variable configuration

## 📚 Additional Documentation

For more detailed information, see:
- [Architecture Documentation](./docs/architecture.md)
- [API Reference](./docs/api-reference.md)
- [Security Guide](./docs/security.md)
- [Docker Guide](./docs/docker.md)
- [Development Guide](./docs/development.md)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### E2E Tests
```bash
cd backend
npm run test:e2e
```

## 🚢 Deployment

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=8001
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://your-backend-url:8001
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📝 License

This project is private and proprietary.

## 👥 Author

Built as a full-stack development project.

---

For detailed documentation, please refer to the [docs](./docs/) folder.

