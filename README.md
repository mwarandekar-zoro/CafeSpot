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

## 📚 Viva Questions & Answers

### Q1: What is Glassmorphism and how is it styled in CaféSpot?
> **A**: Glassmorphism focuses on transparency, multi-layered layouts, and blur effects. In CaféSpot, we implement this using CSS variables like `backdrop-filter: blur(12px)` combined with subtle white borders (`rgba(255, 255, 255, 0.08)`) and translucid shadows.

### Q2: How are the Vibe Scores calculated?
> **A**: Mongoose virtuals are used. When a café document is retrieved, we calculate scores on-the-fly from the stored rating categories:
> - **Study / Work Score**: `(Wi-Fi + Quietness + Ambience) / 3`
> - **Date Score**: `(Ambience + Food + Quietness) / 3`
> - **Coffee / Budget Score**: `(Coffee + Value) / 2`

### Q3: How do we plot cafés on Leaflet without an API key?
> **A**: We use Leaflet with OpenStreetMap tiles served by CartoDB (CartoDB Dark Matter). It provides a dark-mode base map completely free of charge, with no API key or token requirement.

### Q4: How is the 6-month review trend chart rendered without Chart.js/recharts?
> **A**: It is built using pure CSS and React. We bucket reviews by month, find the maximum count, and represent each month's count as a vertical bar using a percentage height (`height: (count / maxCount) * 100%`) within a flex container.

### Q5: How is MongoDB aggregation used to recalculate ratings?
> **A**: Inside `utils/ratingCalculator.js`, we use `Review.aggregate()` with a `$match` stage for the café ID and a `$group` stage to find `$avg` values for all 6 rating fields and count `$sum: 1` reviews. We write the updated average scores back to the café document in a single database operation.

---

## 🎤 Project Presentation Points
3. **Database Performance**: All ratings are recalculated via MongoDB Aggregation Pipelines in a single database roundtrip on change.
4. **Clean Session Guards**: JWT credentials persist in localStorage, providing smooth auth-guards and redirects.
