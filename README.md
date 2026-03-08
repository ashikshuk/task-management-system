# Task Management System (Jira/Trello-style)

A full-stack task management web application with a modern Kanban board UI, similar to a simplified Jira/Trello. Users can sign up, log in, and manage their tasks with statuses, priorities, due dates, drag-and-drop, and statistics.

---

## Tech Stack

- **Frontend**: React.js (modern hooks-based, Vite or CRA)
- **Backend**: Node.js + Express.js (RESTful API)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

---

## Features

- **User Authentication**
  - User signup and login
  - JWT-based authentication
  - Secure password hashing with `bcrypt`

- **Task Management**
  - Create, update, and delete tasks
  - Set priority (`Low`, `Medium`, `High`)
  - Set due dates

- **Task Status Tracking**
  - Kanban-style statuses: `To Do`, `In Progress`, `Completed`
  - Drag-and-drop tasks between status columns

- **Dashboard & Filters**
  - Kanban board view for the logged-in user's tasks
  - Search tasks by title
  - Filter by status, priority, and due date
  - Task statistics: total, completed, and pending tasks

- **Other**
  - Responsive design (mobile and desktop)
  - Centralized error handling and validation
  - Clean, layered architecture (routes, controllers, services)

---

## Project Structure

```text
task-management-system/
  backend/
    package.json
    .env.example
    src/
      server.js
      config/
        db.js
      middleware/
        errorMiddleware.js
      routes/
        authRoutes.js
        taskRoutes.js
      controllers/
        authController.js
        taskController.js
      services/
        authService.js
        taskService.js
      utils/
        generateToken.js
        authMiddleware.js
  frontend/
    (React app: Vite/CRA with components, pages, and hooks)
