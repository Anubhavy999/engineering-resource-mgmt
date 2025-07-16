# Engineering Resource Management System (ERM)

A modern, full-stack Engineering Resource Management System for teams and organizations. Built with the MERN stack, PostgreSQL, and Prisma ORM, ERM empowers managers and engineers to collaborate, track, and optimize engineering resources with a beautiful, professional UI/UX.

---

## 🌟 Features Overview

### Authentication & Authorization
- Secure JWT-based login
- Role-based access (Manager / Engineer)
- Protected routes and session management

### Manager Capabilities
- **Dashboard:**
  - Total engineers, projects, available capacity
  - Underutilized engineers (with visual highlights)
  - Modern, carded, and interactive UI
- **Engineer Management:**
  - Add, edit, and remove engineers
  - Assign roles (Engineer/Manager)
  - Department, skills, certifications, and experience fields
  - Inline details card for each engineer (with last login, department, etc.)
- **Project Management:**
  - Add, edit, delete, and view projects
  - Collapsible project details with description, timeline, team, and tasks
  - Assign engineers to projects and tasks with allocation %
  - Mark projects as done or reopen
  - Add, view and delete comments that will be sent to assigned engineers.
- **Assignment Management:**
  - Assign/Unassign engineers to tasks within projects
  - Capacity validation and allocation tracking
  - View all assignments in a modern, interactive table
- **Notifications:**
  - Real-time notifications for assignments, completion requests, and approvals
  - Mark as read, remove, and badge for unread notifications
- **Task & Completion Requests:**
  - Add, edit, and manage tasks within projects
  - Approve/reject task completion requests from engineers
  - Task comments and discussion (with delete for managers)
- **PDF Export:**
  - Export assignment details to PDF (for reporting or sharing)

### Engineer Capabilities
- **Dashboard:**
  - Welcome message and quick info
  - Assignments summary and remaining capacity
  - Modern, carded, and visually rich UI
- **Projects:**
  - View all assigned projects with details, team, and timeline
  - See all tasks assigned to you, with status and priority
  - Request task completion (with notification to manager)
  - View all comments sent by manager on tasks
- **Assignments:**
  - View all personal assignments in a sortable/filterable table
  - Export assignments to PDF
- **Profile:**
  - Edit personal and professional details (name, department, skills, certifications, experience, etc.)
  - Change password securely
  - Upload and update avatar
  - View last login, performance, and activity stats

### Notifications System
- Real-time, role-based notifications for:
  - Task assignments
  - Completion requests and approvals
  - Project updates
- Visual badge for unread notifications
- Mark as read and remove notifications

### UI/UX & Accessibility
- Premium, modern SaaS-inspired design
- Carded layouts, gradients, and accent borders
- Interactive hover effects and transitions
- Responsive and mobile-friendly
- Accessible color contrast and focus states
- Avatar, icons, and badges for visual clarity

---

## 📂 Project Structure

```
engineering-resource-mgmt/
├── client/         # React frontend (Vite, TailwindCSS)
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── server/         # Express backend (Node.js, Prisma)
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── prisma/
│   └── server.js
```

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- TailwindCSS
- Axios
- jsPDF & jspdf-autotable (PDF export)
- React Icons

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT for authentication

### Database Schema (Key Models)
- **User**: id, firstName, lastName, email, password, role, skills, department, certifications, experience, maxCapacity, avatarUrl, lastLogin, performance, etc.
- **Project**: id, name, description, createdById, startDate, endDate, isClosed, assignments, tasks
- **Assignment**: id, userId, projectId, taskId, allocation
- **Task**: id, projectId, title, description, priority, status, completionRequested, assignments, comments
- **Notification**: id, userId, type, message, read, createdAt
- **Comment**: id, taskId, authorId, content, createdAt

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js
- PostgreSQL
- Git

### Clone the Repository
```bash
git clone https://github.com/Anubhavy999/engineering-resource-mgmt.git
cd engineering-resource-mgmt
```

### Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in `/server` with:
```
DATABASE_URL=<your_postgres_connection_url>
JWT_SECRET=<your_secret>
```
Run migrations and start the server:
```bash
npx prisma migrate dev
npm start
```

### Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

---

## 👤 Demo Access

### Manager
- Email: `shyam@gmail.com`
- Password: `manager123`

### Engineer
- Email: `bob@gmail.com`
- Password: `bob123`

- Email: `alice@gmail.com`
- Password: `alice123`

---

## ✨ Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
MIT

---

## 📬 Contact
Created by [Anubhav Yadav](https://github.com/Anubhavy999) — feel free to reach out!
