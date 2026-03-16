# NEU Library Visitor Log

A full-stack visitor management system built for the New Era University Library.

## 🚀 Live Application
**Link:** [https://neu-library-log-two.vercel.app]

## ✨ Features
- **Secure Authentication:** Google OAuth integration (Restricted to NEU users).
- **Role-Based Access Control (RBAC):** - **Regular Users:** Can log visits and see a "Welcome to NEU Library!" greeting.
  - **Admin (jcesperanza@neu.edu.ph):** Access to a comprehensive dashboard with statistics cards and filters.
- **Admin Dashboard:**
  - View total visitors, employee count, and student count in real-time.
  - Filter logs by College (CICS, CBA, CAS, etc.).
  - Filter by Visitor Type (Student/Employee).
  - Search by Reason for Visit.

## 🛠️ Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google Provider)