# EduTrack – ICTAK Student & Course Management Portal

[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20%7C%20Express%20%7C%20React%20%7C%20Node.js-green)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Completed-success)]()

A comprehensive, role-based Student & Course Management Portal built according to the **ICT Academy of Kerala (ICTAK) MERN Stack Project Guidelines & Student Reference Guide**.

---

## 🔗 Live Links

- **Hosted Application (Live Frontend):** [https://edutrack-mern-client.vercel.app](https://edutrack-mern-client.vercel.app) *(or your deployed Vercel/Render URL)*
- **Hosted Backend API:** [https://edutrack-mern-api.onrender.com](https://edutrack-mern-api.onrender.com) *(or your deployed Render service URL)*
- **GitHub Repository:** [https://github.com/Christy17-tech/edutrack-mern](https://github.com/Christy17-tech/edutrack-mern)

---

## 1. Project Definition (Milestone 1)

### 1.1 Problem Statement
Higher education institutions and training academies often struggle with scattered spreadsheets and fragmented communication for managing student enrollments, course modules, grade assignments, and academic tracking. EduTrack provides a centralized, secure platform to streamline course publishing, student admissions, attendance/progress tracking, and grading with granular role-based access.

### 1.2 Target Users & Roles
| Role | Permissions & Capabilities |
| :--- | :--- |
| **Admin** | Full system authority: manage all courses, view & modify student records, manage trainer assignments, inspect analytics. |
| **Instructor / Trainer** | Create and manage own assigned courses, publish course modules, view enrolled students, enter/update student grades and feedback. |
| **Student** | Browse available course catalog, enroll in courses, view enrolled curriculum, track learning progress, and view assigned grades/certificates. |

### 1.3 MVP Scope
- **Must Have (MVP):**
  - Secure Authentication (JWT, bcrypt password hashing) with Role-Based Access Control (Admin, Instructor, Student).
  - Course Management (CRUD with title, code, department, credits, syllabus modules, instructor reference).
  - Student Directory & Profile Management.
  - Enrollment System (students enroll in courses; instructors/admins review and assign grades).
  - Search, Filter (by department, level), and Pagination on catalog and student lists.
  - Four UI states on every screen (Loading skeleton, Success view, Empty state with call-to-action, Error state with retry).
- **Later Enhancements:**
  - File upload for course materials/assignments (PDFs).
  - Automated certificate generation with digital signature.
  - Payment gateway integration for paid professional courses.
  - Real-time chat/messaging between instructors and students.

### 1.4 User Stories & Acceptance Criteria
1. **User Story 1 (Student Enrollment):**
   - *Story:* As a logged-in Student, I want to browse the course catalog and enroll in an active course so that I can access the curriculum and receive evaluation.
   - *Acceptance Criteria:*
     - Student can view available courses with seats and prerequisites.
     - Clicking "Enroll" sends `POST /api/enrollments` with valid token.
     - Duplicate enrollment is prevented with `409 Conflict` and a user-friendly error toast.
     - Enrolled course immediately appears under "My Enrolled Courses" without manual page reload.
2. **User Story 2 (Instructor Grading):**
   - *Story:* As an Instructor, I want to submit grades and feedback for students in my course so that academic progress is recorded.
   - *Acceptance Criteria:*
     - Instructor can only view and grade students enrolled in their own courses.
     - Grade must be between 0 and 100 or letter grade A–F. Invalid inputs are rejected server-side with `400 Bad Request`.
     - Grade updates reflect immediately in the student's dashboard.
3. **User Story 3 (Course Creation):**
   - *Story:* As an Admin or Instructor, I want to create a new course with syllabus modules so that students can discover it.
   - *Acceptance Criteria:*
     - Requires title, course code, department, description, and at least one module.
     - Course code must be unique (enforced by MongoDB unique index).
     - Non-logged-in or student accounts receive `403 Forbidden`.

### 1.5 Non-Functional Requirements
- **Security:** Passwords salted & hashed with `bcryptjs`. Protected endpoints verified with JWT Bearer tokens. Centralized error handling masks server internals and database errors.
- **Performance:** Paginated database queries with limit/skip to prevent memory leaks; MongoDB indexes on frequent lookup fields (`email`, `code`, `student`, `course`).
- **Accessibility:** Semantic HTML elements, accessible form labels, keyboard navigation, and WCAG AA contrast compliance.
- **Responsiveness:** Mobile-first responsive layout tested from 375px mobile viewports to widescreen displays.

---

## 2. Architecture & Data Model

### 2.1 System Architecture
```
+-------------------------------------------------------------+
|                     React Client (Vite)                     |
|  - Pages (Catalog, Dashboard, Enrollments, Admin Directory) |
|  - AuthContext (JWT State, User Role)                       |
|  - Centralized API Service (Axios/Fetch with Interceptor)   |
+------------------------------+------------------------------+
                               |
                   HTTPS / JSON API Requests
                               |
+------------------------------v------------------------------+
|                     Node.js / Express API                   |
|  - Express Router (/api/auth, /api/courses, /api/enroll)    |
|  - Security Middleware (CORS, Auth JWT, Role Guard)         |
|  - Controllers & Joi/Mongoose Data Validation               |
|  - Central Error Handling Middleware                        |
+------------------------------+------------------------------+
                               |
                       Mongoose ODM
                               |
+------------------------------v------------------------------+
|                       MongoDB Database                      |
|  - users collection (hashed passwords, role enum)           |
|  - courses collection (code index, embedded modules)        |
|  - enrollments collection (compound unique index)           |
+-------------------------------------------------------------+
```

### 2.2 Data Model & Schemas
- **User Schema (`users`)**:
  - `name`: String (Required, trimmed)
  - `email`: String (Required, unique index, lowercase)
  - `password`: String (Required, hashed with bcrypt, omitted in JSON responses)
  - `role`: String (Enum: `'student'`, `'instructor'`, `'admin'`, default: `'student'`)
  - `department`: String (Optional)
  - `phone`: String (Optional)
  - `timestamps`: `{ createdAt, updatedAt }`
- **Course Schema (`courses`)**:
  - `title`: String (Required, indexed)
  - `code`: String (Required, unique index, uppercase, e.g., "ICT-FS101")
  - `description`: String (Required)
  - `department`: String (Required, e.g., "Software Development", "Data Science")
  - `instructor`: ObjectId (Ref: `'User'`, Required)
  - `credits`: Number (Required, min: 1, max: 6)
  - `maxCapacity`: Number (Default: 40)
  - `modules`: Array of embedded objects: `[{ title, durationHours, description }]`
  - `status`: String (Enum: `'draft'`, `'active'`, `'archived'`, default: `'active'`)
  - `timestamps`: `{ createdAt, updatedAt }`
- **Enrollment Schema (`enrollments`)**:
  - `student`: ObjectId (Ref: `'User'`, Required)
  - `course`: ObjectId (Ref: `'Course'`, Required)
  - `status`: String (Enum: `'enrolled'`, `'in-progress'`, `'completed'`, `'dropped'`, default: `'enrolled'`)
  - `grade`: String (Enum: `'A+'`, `'A'`, `'B'`, `'C'`, `'D'`, `'F'`, `'Pending'`, default: `'Pending'`)
  - `feedback`: String (Optional)
  - `enrolledAt`: Date (Default: `Date.now`)
  - *Compound Index:* `{ student: 1, course: 1 }` (unique constraint preventing duplicate enrollments)

---

## 3. API Contract

| Method | Endpoint | Description | Auth Required | Success Response | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new user account | None | `201 Created` + token & user | `400`, `409` |
| **POST** | `/api/auth/login` | Authenticate & get JWT token | None | `200 OK` + token & user | `400`, `401` |
| **GET** | `/api/auth/me` | Get logged-in user profile | Bearer Token | `200 OK` + user | `401` |
| **GET** | `/api/courses` | List courses (with search/pagination) | None | `200 OK` + array & paging | `500` |
| **GET** | `/api/courses/:id` | Get single course detail | None | `200 OK` + course object | `404` |
| **POST** | `/api/courses` | Create new course | Instructor / Admin | `201 Created` + course | `400`, `401`, `403` |
| **PUT** | `/api/courses/:id` | Update course details | Instructor (owner) / Admin | `200 OK` + updated course | `400`, `401`, `403`, `404` |
| **DELETE** | `/api/courses/:id` | Delete course | Admin | `200 OK` | `401`, `403`, `404` |
| **GET** | `/api/enrollments` | List enrollments for user/course | Bearer Token | `200 OK` + enrollments array | `401` |
| **POST** | `/api/enrollments` | Enroll current student in course | Student only | `201 Created` + enrollment | `400`, `401`, `409` |
| **PATCH** | `/api/enrollments/:id/grade` | Submit student grade | Instructor / Admin | `200 OK` + enrollment | `400`, `401`, `403`, `404` |
| **GET** | `/api/users/students` | List all students | Instructor / Admin | `200 OK` + student list | `401`, `403` |
| **GET** | `/api/dashboard/stats` | Academic analytics summary | Bearer Token | `200 OK` + KPI metrics | `401` |

---

## 4. Project Structure (Section 4 Compliance)

```
edutrack-mern/
├── client/                     # Frontend React application (Vite)
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable UI pieces (Navbar, Modal, StatCard, Loader, Badge)
│   │   ├── context/            # AuthContext & State management
│   │   ├── pages/              # Route views (Catalog, Dashboard, CourseDetail, Login, Register, Admin)
│   │   ├── services/           # Centralized API service (api.js)
│   │   ├── App.jsx             # SPA Route declarations & Protected Routes
│   │   ├── main.jsx            # Application entry
│   │   └── index.css           # Modern styles & responsive utilities
│   ├── .env.example            # Frontend environment variable template
│   ├── package.json
│   ├── vercel.json             # SPA fallback configuration for Vercel deployment
│   └── vite.config.js
├── server/                     # Backend Node/Express API
│   ├── src/
│   │   ├── config/             # Database connection (db.js)
│   │   ├── controllers/        # Request controllers (auth, course, enrollment, user)
│   │   ├── middleware/         # Auth verification, role guards, error handlers
│   │   ├── models/             # Mongoose schemas (User, Course, Enrollment)
│   │   ├── routes/             # Express route mappings
│   │   ├── seed/               # Database demo seed script (seed.js)
│   │   └── server.js           # Server bootstrap & middleware setup
│   ├── .env.example            # Backend environment variable template
│   └── package.json
├── .gitignore                  # Git ignore rules (node_modules, .env, dist)
└── README.md                   # Comprehensive project documentation
```

---

## 5. Local Setup & Installation

### Prerequisites
- **Node.js** v18+ or v20+
- **npm** v9+
- **MongoDB** (Local instance or free MongoDB Atlas URI)

### Step 1: Clone Repository
```bash
git clone https://github.com/Christy17-tech/edutrack-mern.git
cd edutrack-mern
```

### Step 2: Backend Configuration & Startup
```bash
cd server
npm install

# Copy environment template
cp .env.example .env
```
Edit `server/.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/edutrack_db
# (or MongoDB Atlas: mongodb+srv://<user>:<password>@cluster0.mongodb.net/edutrack?retryWrites=true&w=majority)
JWT_SECRET=super_secret_jwt_key_ictak_2026
CLIENT_URL=http://localhost:5173
```
Seed demo courses, instructors, and students:
```bash
npm run seed
```
Start development server:
```bash
npm run dev
# Server running at http://localhost:5000
```

### Step 3: Frontend Configuration & Startup
Open a new terminal window:
```bash
cd client
npm install

# Copy environment template
cp .env.example .env
```
Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the frontend:
```bash
npm run dev
# Vite server running at http://localhost:5173
```

---

## 6. Seed Accounts for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@ictkerala.org` | `Admin@123` |
| **Instructor** | `priya.nair@ictkerala.org` | `Trainer@123` |
| **Student** | `rahul.kumar@gmail.com` | `Student@123` |

---

## 7. Deployment Instructions (Milestone 8)

### Option A: Frontend on Vercel
1. Push repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `edutrack-mern` repository.
4. Set **Root Directory** to `client`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your live backend URL (e.g., `https://edutrack-mern-api.onrender.com/api`).
6. Click **Deploy**. The `client/vercel.json` ensures all client-side routes (like `/dashboard`, `/courses`) redirect properly to `index.html`.

### Option B: Backend on Render
1. Go to [Render](https://render.com) and select **"New Web Service"**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A long random string.
   - `CLIENT_URL`: Your live Vercel URL (e.g., `https://edutrack-mern-client.vercel.app`).
5. Click **Create Web Service**.

---

## 8. Self-Review Checklist (Section 14 Compliance)

- [x] **Clear Problem & Scope:** Educated role-based course & student management solved within MVP bounds.
- [x] **End-to-end Flow:** User can register -> browse courses -> enroll -> instructor grades -> student dashboard displays updated grade.
- [x] **Full Stack Validation:** Client provides instant field validation & submit spinners; server validates all payloads with Mongoose types, regex, and enums.
- [x] **Security:** bcrypt password hashing, JWT bearer auth, role authorization middleware, parameterized MongoDB queries preventing NoSQL injection.
- [x] **Zero Secrets in Git:** `.gitignore` actively ignores `.env` files; `.env.example` templates committed.
- [x] **Four UI States:** Loading spinner/skeletons, populated data cards, empty states with call-to-actions, and error alerts with retry triggers.
- [x] **Responsive & Accessible:** Fully responsive navigation bar, mobile drawer, semantic elements, and keyboard navigability.
