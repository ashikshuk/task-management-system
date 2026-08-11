# Task Management System

Full-stack task management app with JWT authentication, task filtering, a Kanban-style board, and a stats dashboard — built with a Node.js/Express REST API and a PostgreSQL database.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Screenshots](#screenshots)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

The Task Management System helps users create, organize, and track their tasks through priorities, statuses, and a Kanban board. It's a full-stack project demonstrating REST API design, JWT-based authentication, PostgreSQL data modeling, and frontend–backend integration — built to mirror how a simplified team productivity tool works under the hood.

---

## Features

- User signup and login with JWT authentication
- Passwords hashed with bcrypt (never stored or returned in plaintext)
- Create, update, and delete tasks, scoped per user
- Task priority (`low`, `medium`, `high`) and status (`todo`, `in_progress`, `completed`)
- Filtering by status, priority, search term, and due date range
- Dashboard with task statistics (total, completed, pending, completion rate)
- Kanban-style board for visual task management
- Responsive UI

---

## Tech Stack

**Frontend**
- React.js
- HTML / CSS / JavaScript

**Backend**
- Node.js
- Express.js
- JWT (`jsonwebtoken`) for authentication
- bcryptjs for password hashing
- express-validator for request validation

**Database**
- PostgreSQL

**Tools**
- Git / GitHub
- REST APIs

---

## Project Structure

```
task-management-system/
├── config/
│   ├── db.js              # PostgreSQL connection/query helper
│   └── env.js             # Validates required env vars at startup
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   └── authmiddleware.js  # JWT verification, attaches req.user
├── routes/
│   ├── authRoute.js
│   └── taskRoute.js
├── services/
│   ├── authService.js     # User creation, authentication
│   └── taskService.js     # Task CRUD, filtering, stats
├── utils/
│   └── generateToken.js
├── validators/
│   ├── authValidators.js
│   └── taskValidators.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)

### 1. Clone the repository

```bash
git clone https://github.com/ashikshuk/task-management-system.git
cd task-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for what's required.

### 4. Set up the database

Create the database and apply the schema (adjust to however you're managing migrations):

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'todo',
  priority VARCHAR(10) DEFAULT 'medium',
  due_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Start the server

```bash
npm start
```

The API runs at:

```
http://localhost:3000
```

---

## Environment Variables

| Variable         | Required | Description                                  |
|------------------|----------|-----------------------------------------------|
| `DATABASE_URL`   | Yes      | PostgreSQL connection string                  |
| `JWT_SECRET`     | Yes      | Secret used to sign JWTs — must be a long, random string |
| `JWT_EXPIRES_IN` | No       | Token lifetime (default: `7d`)                |
| `PORT`           | No       | Server port (default: `3000`)                 |
| `NODE_ENV`       | No       | `development` or `production`                 |

The app will refuse to start if `JWT_SECRET` or `DATABASE_URL` is missing — this is intentional, to prevent ever running with an insecure default secret.

---

## API Overview

**Auth**
| Method | Endpoint            | Description            |
|--------|---------------------|--------------------------|
| POST   | `/api/auth/signup`  | Create a new account    |
| POST   | `/api/auth/login`   | Log in, receive a JWT   |

**Tasks** *(all require `Authorization: Bearer <token>`)*
| Method | Endpoint            | Description                            |
|--------|----------------------|------------------------------------------|
| GET    | `/api/tasks`         | List tasks (supports filtering)         |
| POST   | `/api/tasks`         | Create a task                           |
| PATCH  | `/api/tasks/:id`     | Update a task                           |
| DELETE | `/api/tasks/:id`     | Delete a task                           |
| GET    | `/api/tasks/stats`   | Task statistics for the current user    |

**Query params for `GET /api/tasks`:** `status`, `priority`, `search`, `dueFrom`, `dueTo`

---

## Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Kanban Board
![Kanban Board](./screenshots/kanban-board.png)

### Task Form
![Task Form](./screenshots/task-form.png)

---

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12) and never returned in API responses.
- JWTs are signed with `HS256` using a secret that must be set via environment variable — there is no insecure fallback.
- Login responses take constant time regardless of whether the email exists, to prevent user enumeration via timing.
- All task queries are scoped to `req.user.id`; users cannot read, update, or delete tasks belonging to another account.
- All database queries use parameterized statements — no raw string interpolation into SQL.

---

## Roadmap

- [ ] Real-time task updates (WebSockets)
- [ ] Team/collaborative task sharing
- [ ] Due date reminders and notifications
- [ ] Rate limiting on auth endpoints
- [ ] Pagination on task list endpoint
- [ ] Deployment (Render/Railway backend, Vercel frontend)

---

## Author

**Ashik Kumar Shukla**
GitHub: [@ashikshuk](https://github.com/ashikshuk)




