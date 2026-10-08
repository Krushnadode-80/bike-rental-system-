# 🏍️ Bike Rental System

A full-stack Bike Rental System that allows users to browse available bikes, book rentals, manage reservations, and securely authenticate. The application includes an admin dashboard for managing bikes, users, and bookings with a responsive modern UI.

---

## 🌟 Highlights

- 🌟 Tech Stack: React + FastAPI + PostgreSQL + SQLAlchemy
- 🔐 Secure Authentication using JWT
- 🏍️ Browse and Rent Bikes
- 📅 Real-time Bike Availability & Booking Management
- 👤 User Dashboard & Booking History
- 🛠️ Admin Dashboard for Bike Management
- 📱 Fully Responsive Design
- 🚀 REST API Architecture
- 🐞 Client & Server-side Validation and Error Handling

---

## ✨ Features

### 👤 User

- 🔐 User Signup & Login
- 🏍️ Browse Available Bikes
- 🔍 Search & Filter Bikes
- 📅 Book Bikes by Date & Time
- 💳 Rental Price Calculation
- 📖 View Booking History
- ❌ Cancel Bookings
- 👤 Manage User Profile

### 🛠️ Admin

- ➕ Add New Bikes
- ✏️ Update Bike Details
- ❌ Delete Bikes
- 👥 Manage Users
- 📊 View Booking Analytics
- 📋 Manage All Bookings
- 📈 Dashboard with Rental Statistics

---

## 🛠️ Technologies Used

### Backend

- ⚡ FastAPI
- 🐍 Python
- 🗄️ PostgreSQL
- 🧩 SQLAlchemy ORM
- 🔄 Alembic
- 🔑 JWT Authentication
- ✅ Pydantic
- 🚀 Uvicorn

### Frontend

- ⚛️ React.js
- 🎨 CSS3
- 📡 Axios
- 🔀 React Router DOM
- ⚡ Vite

---

## 📂 Project Structure

```
Bike-Rental-System
│
├── backend
│   ├── app
│   ├── models
│   ├── routes
│   ├── schemas
│   ├── database
│   ├── utils
│   └── main.py
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── assets
│   └── App.jsx
│
└── README.md
```

---

# 🚀 Getting Started

## ✅ Prerequisites

Make sure you have installed:

- 📥 Python 3.11+
- 📥 Node.js
- 📦 npm
- 🗄️ PostgreSQL
- 🔄 Git

---

## 📌 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Krushnadode-80/bike-rental-system.git

cd bike-rental-system
```

---

### 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Create a `.env` file inside the **backend** directory.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/bike_rental

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.7-flash
```

The signed-in home page includes an AI chat assistant. The backend uses the Gemini API for general rental questions and read-only function tools for live bike search (including date and daily price filters), bike details, daily rental estimates, and the signed-in user's own bookings. Location filters are not available because the bike inventory has no location field. Install the backend requirements and set `GEMINI_API_KEY` in `backend/.env`; the key is never sent to the React app.

---

# 📸 Main Modules

- 🏠 Home Page
- 🔐 Authentication
- 🏍️ Bike Listing
- 🔍 Search & Filter
- 📅 Booking System
- 👤 User Dashboard
- 📖 Booking History
- 🛠️ Admin Dashboard
- 📊 Analytics

---

# 🚀 Future Improvements

- 💳 Online Payment Integration
- 📍 Live Bike Tracking
- ⭐ User Ratings & Reviews
- 🔔 Email Notifications
- 📱 Mobile Application
- ☁️ Cloud Deployment
- 📈 Advanced Analytics Dashboard

---

# 👨‍💻 Author

**Krushna Dode**

GitHub:
https://github.com/Krushnadode-80

---

# ⭐ Support

If you like this project, don't forget to give it a ⭐ on GitHub!
