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

## Phase 1 Features

### User Authentication
- Registration with full profile (name, age, gender, mobile, email, fitness goal)
- Login with JWT authentication
- Forgot / Reset password flow
- Secure logout

### User Profile
- View & edit personal information
- Body metrics (height, weight, target weight)
- Auto-calculated BMI with health category indicator

### Admin Portal (`/admin/*`)
- Separate admin login
- Dashboard with statistics cards
- User management (CRUD + search)
- Trainer management (CRUD with specializations)
- Membership plan management (CRUD)

### Security
- JWT token-based authentication
- Bcrypt password hashing
- Role-based access control (member / admin)
- Protected API routes
- Input validation (client + server)

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard-stats` | Dashboard statistics |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/users` | List all users |
| GET | `/api/auth/users?q=` | Search users |
| GET | `/api/auth/users/:id` | Get user details |
| PUT | `/api/auth/users/:id` | Edit user |
| DELETE | `/api/auth/users/:id` | Delete user |

### Trainers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trainers` | List trainers |
| GET | `/api/trainers/:id` | Get trainer |
| POST | `/api/trainers` | Add trainer (admin) |
| PUT | `/api/trainers/:id` | Edit trainer (admin) |
| DELETE | `/api/trainers/:id` | Delete trainer (admin) |

### Membership Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memberships/plans` | List plans |
| POST | `/api/memberships/plans` | Add plan (admin) |
| PUT | `/api/memberships/plans/:id` | Edit plan (admin) |
| DELETE | `/api/memberships/plans/:id` | Delete plan (admin) |

---

## MongoDB Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles and auth data |
| `admins` | Admin accounts |
| `trainers` | Trainer profiles |
| `membership_plans` | Plan templates (admin-managed) |
| `memberships` | User subscription records |
| `password_reset_tokens` | Password reset tokens |
| `workouts` | Workout log entries |
| `bookings` | Trainer booking records |

---

## Folder Structure

```
Rise-and-Rep/
├── backend/
│   ├── app.py                   # Flask application
│   ├── config.py                # Configuration
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables
│   ├── database/
│   │   └── db.py                # MongoDB connection
│   ├── models/
│   │   ├── user_model.py        # User CRUD
│   │   ├── admin_model.py       # Admin auth
│   │   ├── trainer_model.py     # Trainer CRUD
│   │   ├── membership_model.py  # Plan + subscription CRUD
│   │   ├── password_reset_model.py
│   │   └── workout_model.py
│   ├── routes/
│   │   ├── auth_routes.py       # Auth & user management
│   │   ├── admin_routes.py      # Admin login & stats
│   │   ├── trainer_routes.py    # Trainer endpoints
│   │   ├── membership_routes.py # Plan endpoints
│   │   └── workout_routes.py
│   ├── middleware/
│   │   └── auth_middleware.py   # JWT & role guards
│   ├── utils/
│   │   └── jwt_handler.py       # Token encode/decode
│   └── services/
│       ├── workout_service.py
│       └── recommendation_service.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx             # App entry
│       ├── App.jsx              # Router
│       ├── index.css            # Global styles
│       ├── api/
│       │   └── axiosInstance.js  # HTTP client
│       ├── context/
│       │   ├── AuthContext.jsx   # Auth state
│       │   └── ToastContext.jsx  # Notifications
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── useToast.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── AdminLayout.jsx  # Admin sidebar layout
│       │   ├── Modal.jsx
│       │   ├── ConfirmDialog.jsx
│       │   ├── TrainerCard.jsx
│       │   └── WorkoutCard.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── ForgotPassword.jsx
│           ├── ResetPassword.jsx
│           ├── Dashboard.jsx
│           ├── Profile.jsx
│           ├── Workout.jsx
│           ├── Membership.jsx
│           ├── TrainerBooking.jsx
│           └── admin/
│               ├── AdminLogin.jsx
│               ├── AdminDashboard.jsx
│               ├── AdminUsers.jsx
│               ├── AdminTrainers.jsx
│               └── AdminMemberships.jsx
└── README.md
```

---

## License

This project is for educational purposes.
