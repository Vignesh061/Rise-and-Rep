# Rise & Rep — Gym Management System

A modern, full-stack gym management system built with React, Flask, and MongoDB.

![Dark Theme](https://img.shields.io/badge/Theme-Dark-141414)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248)

---

## Tech Stack

### Frontend
- **React.js** — UI library
- **React Router** — Client-side routing
- **Axios** — HTTP client
- **Tailwind CSS** — Utility-first styling
- **React Icons** — Icon library
- **Vite** — Build tool

### Backend
- **Python Flask** — REST API framework
- **PyJWT** — JWT authentication
- **Bcrypt** — Password hashing
- **Flask-CORS** — Cross-origin support
- **PyMongo** — MongoDB driver
- **python-dotenv** — Environment variables
- **python-dateutil** — Date arithmetic

### Database
- **MongoDB** — NoSQL database

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (running on localhost:27017)

### Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
python app.py
```

Backend runs at **http://localhost:5000**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Default Admin Credentials

| Username | Password |
|----------|----------|
| `admin`  | `admin123` |

Access the admin portal at: `/admin/login`

---

## Phase 1 & 2 Features

### User Experience
- **Authentication:** Registration, Login, Forgot/Reset Password, JWT protection.
- **Profile Management:** View/Edit personal info, BMI tracking, Body metrics.
- **Membership Purchase:** View packages, purchase with simulated payment, auto-calculated end dates.
- **Membership Dashboard:** Track days remaining, plan status, and quick renewals.
- **History & Invoices:** View tabular history of purchases, and generate printable HTML invoices.

### Admin Experience
- **Admin Dashboard:** Real-time stats on total users, trainers, active/expiring/expired members, and revenue.
- **Package Management (CRUD):** Create, edit, and toggle membership plans.
- **Member Tracking:** Filter and search active members, dedicated expiring (within 7 days) and expired dashboards.
- **Reports:** Generate tabular reports and export to CSV.
- **User/Trainer Management:** Full CRUD operations for system users and gym trainers.

---

## License

This project is for educational purposes.
