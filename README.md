<div align="center">

# 🏋️ Rise-and-Rep

### Your Ultimate Gym Companion

[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)

**Track workouts · Manage memberships · Book elite trainers · Crush every rep.**

</div>

---

## 📸 Overview

**Rise-and-Rep** is a full-stack gym management web application built with a sleek. It provides gym members with tools to log workouts, manage memberships, book personal trainers, and receive AI-powered workout recommendations — all in one place.

### ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure JWT-based signup & login with bcrypt password hashing |
| 💪 **Workout Tracking** | Log exercises with sets, reps, and weight — view full history |
| 📊 **Dashboard** | Personalised overview with workout stats and progress insights |
| 🏅 **Membership Plans** | Browse and purchase Basic, Standard, or Premium plans |
| 🧑‍🏫 **Trainer Booking** | Browse certified trainers by specialty and book sessions |
| 🤖 **Smart Recommendations** | Goal-based workout suggestions (weight loss, muscle gain, endurance, flexibility) |
| 🎨 **Premium UI** | Glassmorphism, gradient accents, smooth animations, and a dark Netflix-style theme |
| 📱 **Responsive** | Fully responsive design that looks great on desktop, tablet, and mobile |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI with hooks
- **Vite 5** — Lightning-fast dev server and build tool
- **Tailwind CSS 3.4** — Utility-first styling
- **React Router 6** — Client-side routing with protected routes
- **Axios** — HTTP client for API communication
- **React Icons** — Icon library

### Backend
- **Flask 3.0** — Lightweight Python web framework
- **PyMongo 4.6** — MongoDB driver for Python
- **PyJWT** — JSON Web Token authentication
- **bcrypt** — Secure password hashing
- **Flask-CORS** — Cross-origin resource sharing
- **Gunicorn** — Production WSGI server

### Database
- **MongoDB** — NoSQL document database

### Deployment
- **Render** — Cloud hosting with auto-deploy (`render.yaml` included)

---

## 📁 Project Structure

```
Rise-and-Rep/
├── backend/
│   ├── app.py                  # Flask app factory & entry point
│   ├── config.py               # Environment configuration
│   ├── requirements.txt        # Python dependencies
│   ├── database/               # MongoDB connection setup
│   ├── middleware/
│   │   └── auth_middleware.py   # JWT authentication middleware
│   ├── models/
│   │   ├── user_model.py       # User schema & DB operations
│   │   ├── workout_model.py    # Workout schema & DB operations
│   │   ├── membership_model.py # Membership schema & DB operations
│   │   └── trainer_model.py    # Trainer schema & seed data
│   ├── routes/
│   │   ├── auth_routes.py      # /api/auth/* — register, login
│   │   ├── workout_routes.py   # /api/workouts/* — CRUD operations
│   │   ├── membership_routes.py# /api/memberships/* — plan management
│   │   └── trainer_routes.py   # /api/trainers/* — listing & booking
│   ├── services/
│   │   ├── workout_service.py  # Workout business logic
│   │   └── recommendation_service.py # Goal-based recommendations
│   └── utils/                  # Utility helpers
│
├── frontend/
│   ├── index.html              # HTML entry point
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Root component with routing
│       ├── index.css           # Global styles & design tokens
│       ├── api/                # Axios API client
│       ├── context/            # React context (auth state)
│       ├── hooks/              # Custom hooks (useAuth)
│       ├── components/
│       │   ├── Navbar.jsx      # Navigation bar
│       │   ├── Sidebar.jsx     # Dashboard sidebar
│       │   ├── WorkoutCard.jsx # Workout display card
│       │   └── TrainerCard.jsx # Trainer display card
│       └── pages/
│           ├── Home.jsx        # Landing page with hero & pricing
│           ├── Login.jsx       # Login page
│           ├── Register.jsx    # Registration page
│           ├── Dashboard.jsx   # User dashboard
│           ├── Workout.jsx     # Workout logging & history
│           ├── Membership.jsx  # Membership plans
│           └── TrainerBooking.jsx # Trainer browsing & booking
│
└── render.yaml                 # Render deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.11
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/Vignesh061/rise-and-rep.git
cd rise-and-rep
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/smart_gym
JWT_SECRET=your-secret-key
PORT=5000
```

Start the backend:

```bash
python app.py
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/workouts` | Get user's workout history |
| `POST` | `/api/workouts` | Log a new workout |
| `DELETE` | `/api/workouts/:id` | Delete a workout |

### Memberships
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/memberships` | Get user's membership |
| `POST` | `/api/memberships` | Purchase a plan |

### Trainers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trainers` | List all trainers |
| `POST` | `/api/trainers/book` | Book a trainer session |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | API health check |

---

## 🌐 Deployment

This project is configured for one-click deployment on **Render** using the included `render.yaml`.

1. Push your code to GitHub
2. Connect the repository to [Render](https://render.com)
3. Set the required environment variables (`MONGO_URI`)
4. Render will automatically build the frontend and start the backend

---

## 🎨 Design Philosophy

Rise-and-Rep draws inspiration from **Netflix's design language**:

- **Deep black backgrounds** (`#141414`) for a cinematic feel
- **Signature red accents** (`#E50914`) for CTAs and highlights
- **Glassmorphism** for cards with frosted-glass blur effects
- **Gradient text** for bold headings and pricing
- **Micro-animations** — pulse blobs, hover lifts, smooth transitions
- **Inter font family** for clean, modern typography

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request


