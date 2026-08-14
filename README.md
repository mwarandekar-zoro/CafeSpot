# CaféSpot ☕ — Premium Café Vibe Discovery Platform

A full-stack MERN application designed to help users discover the perfect café spot based on their specific vibe (Work, Study, Date, Chill, Budget). Includes a precision 6-category rating system, automated vibe scores, an interactive Map View (Leaflet + OpenStreetMap), and an Owner Analytics Dashboard with CSS spark charts.

---

## 🚀 Key Features
- **Interactive Map View (Leaflet + OpenStreetMap)**: Plot cafés using real-time lat/lng coordinates. Styled using CartoDB Dark Matter tiles, custom category-themed glowing SVG pin markers, and glassmorphic popups that click through to details.
- **Owner Analytics Dashboard**: Comprehensive dashboard featuring:
  - Portfolio performance metrics (Aggregate rating, review volumes, average engagement).
  - Expandable café cards displaying score breakdowns (Coffee, Food, Ambience, Wi-Fi, Quietness, Value) via CSS progress bars.
  - 6-month review volume trends using pure CSS spark charts.
  - Auto-generated "⭐ TOP" badge for the best performing café in the portfolio.
- **Vibe Engine**: Automatically computes Work, Study, Date, Chill, and Budget scores based on customer reviews.
- **Search & Filters**: Real-time filters by category, price tier, average rating, and vibe threshold.
- **Modern Dark UI**: Fluid glassmorphism styled with custom CSS variables, custom SVG logo, and responsive mobile adaptation.

---

## 📦 Technology Stack
- **Frontend**: React (Vite), React Router, Leaflet, React Leaflet, Axios, Custom Vanilla CSS.
- **Backend**: Node.js, Express.js, JWT Authentication.
- **Database**: MongoDB (Atlas) + Mongoose ODM.

---

## 📂 Project Folder Structure
```
CaféSpot/
├── backend/
│   ├── config/            # DB Connection config
│   ├── controllers/       # Route request handlers
│   ├── middleware/        # JWT & Admin/Owner route guards
│   ├── models/            # Mongoose schemas (User, Cafe, Review, Favorite)
│   ├── routes/            # REST API endpoints
│   ├── utils/             # ratingCalculator aggregation pipeline
│   ├── seed.js            # Mumbai sample café data populator (14 locations)
│   ├── seedUsers.js       # Demo test account generator (visitor, owner, admin)
│   └── server.js          # App entry point
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI elements (Navbar, CafeCard, SearchBar, etc.)
    │   ├── context/       # AuthContext for session management
    │   ├── pages/         # Home, Cafes, CafeDetails, MapView, OwnerDashboard, etc.
    │   ├── services/      # Axios API request modules
    │   ├── index.css      # Premium Glassmorphism CSS design system
    │   └── main.jsx       # Client entry
```

---

## 📡 REST API Overview

### 🔐 Authentication
- `POST /api/auth/register` - Register a new account.
- `POST /api/auth/login` - Authenticate and receive JWT.

### ☕ Cafes
- `GET /api/cafes` - Browse, search, filter, paginate cafés.
- `GET /api/cafes/:id` - Detailed view of a single café.
- `POST /api/cafes` - Create a new spot (Protected).
- `PUT /api/cafes/:id` - Update details (Owner or Admin).
- `DELETE /api/cafes/:id` - Remove a café (Owner or Admin).

### ✍️ Reviews & Ratings
- `GET /api/cafes/:id/reviews` - Read reviews for a café.
- `POST /api/cafes/:id/reviews` - Add a 6-metric review (Protected, Limit 1 per user).
- `PUT /api/reviews/:id` - Edit own review comment/scores (Owner only).
- `DELETE /api/reviews/:id` - Delete review (Owner or Admin).

### 💖 Favorites
- `GET /api/favorites` - Get logged-in user's favorites list.
- `POST /api/favorites/:cafeId` - Save a café spot.
- `DELETE /api/favorites/:cafeId` - Unsave a café spot.

### 📊 Owner Dashboard
- `GET /api/users/owner-dashboard` - Retrieve owner stats, reviews trend, and portfolio (Owner/Admin only).

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` inside the `/backend` folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.fh6qa63.mongodb.net/cafespot
JWT_SECRET=your_super_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 🛠️ Setup & Running Instructions

### 1. Database Seeding
Populate MongoDB with 14 Mumbai cafés (Bandra, Juhu, Colaba, Lower Parel, Powai, etc.) and create the demo user accounts:
```bash
cd backend
npm install
node seed.js
node seedUsers.js
```

### 2. Start Backend Server
```bash
npm run dev
```

### 3. Start Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```

Visit the app at **[http://localhost:5173](http://localhost:5173)** (or `http://localhost:5174` if port 5173 is in use).

---

## 🧑‍💼 User Roles & Permissions
- **Visitor (Explorer)**: Default role. Can search, read reviews, add favorites, and write reviews.
- **Owner**: Can list new cafés, manage their own listings, and view advanced analytics (rating breakdowns, monthly trends, aggregate portfolio metrics).
- **Admin**: Global system privileges.

---

## 👥 Demo Credentials
Run `node seedUsers.js` to initialize these accounts:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Explorer (Visitor)** | `explorer@cafespot.dev` | `explorer123` | Search, favorite, write reviews |
| **Owner** | `owner@cafespot.dev` | `owner123` | Analytics, add/edit/delete own cafés |
| **Admin** | `admin@cafespot.dev` | `admin123` | Full global access |

---

## 🎤 Project Presentation Points
1. **Interactive Dark Map**: Present the split-panel MapView showcasing CartoDB Dark Matter tiles, custom category SVG pins, and real-time live filtering.
2. **Expandable Analytics**: Demonstrate the Owner Dashboard's score progress bars and the 6-month review volume trend chart built purely in CSS.
3. **Database Performance**: All ratings are recalculated via MongoDB Aggregation Pipelines in a single database roundtrip on change.
4. **Clean Session Guards**: JWT credentials persist in localStorage, providing smooth auth-guards and redirects.

