# CaféSpot ☕ — Premium Café Vibe Discovery Platform

A full-stack MERN application designed to help users discover the perfect café spot based on their specific vibe (Work, Study, Date, Chill, Budget). Includes a precision 6-category rating system, automated vibe scores, and live search/filters.

---

## 🚀 Technology Stack
- **Frontend**: React (Vite), React Router, Axios, Custom Vanilla CSS Design System (Dark Night Café + Glassmorphism).
- **Backend**: Node.js, Express.js, JWT Authentication.
- **Database**: MongoDB (Atlas) + Mongoose ODM.

---

## 📂 Project Folder Structure
```
CaféSpot/
├── backend/
│   ├── config/            # DB Connection config
│   ├── controllers/       # Route request handlers
│   ├── middleware/        # JWT & Admin route guards
│   ├── models/            # Mongoose schemas (User, Cafe, Review, Favorite)
│   ├── routes/            # REST API endpoints
│   ├── utils/             # ratingCalculator aggregation pipeline
│   ├── seed.js            # Sample café data populator
│   └── server.js          # App entry point
└── frontend/
    ├── src/
    │   ├── components/    # Reusable glass UI elements
    │   ├── context/       # AuthContext for session management
    │   ├── pages/         # Home, Cafes, CafeDetails, AddCafe, etc.
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
Populate MongoDB with 6 sample cafés:
```bash
cd backend
npm install
node seed.js
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

Visit the app at **[http://localhost:5173](http://localhost:5173)**.

---

## 👥 Demo Credentials
- **Admin / Demo Account**:
  - **Email**: `seed@cafespot.dev`
  - **Password**: `seedpass123`

---

## 📚 Viva Questions & Answers

### Q1: What is Glassmorphism and how is it styled in CaféSpot?
> **A**: Glassmorphism is a modern UI design trend focusing on transparency, multi-layered layouts, and blur effects. In CaféSpot, we implement this using CSS variables like `backdrop-filter: blur(12px)` combined with subtle white borders (`rgba(255, 255, 255, 0.08)`) and translucid shadows.

### Q2: How are the Vibe Scores calculated without AI?
> **A**: Mongoose virtuals are used. When a café document is loaded, we calculate scores on-the-fly from the stored rating categories:
> - **Study / Work Score**: `(Wi-Fi + Quietness + Ambience) / 3`
> - **Date Score**: `(Ambience + Food + Quietness) / 3`
> - **Coffee / Budget Score**: `(Coffee + Value) / 2`

### Q3: How is MongoDB aggregation used to recalculate ratings?
> **A**: Inside `utils/ratingCalculator.js`, we use `Review.aggregate()` with a `$match` stage for the café ID and a `$group` stage to find `$avg` values for all 6 rating fields and count `$sum: 1` reviews. We write the updated average scores back to the café document in a single round-trip.

### Q4: How do you prevent a user from favoriting a café twice?
> **A**: We apply two layers: a DB-level index constraints check `favoriteSchema.index({ user: 1, cafe: 1 }, { unique: true })`, and a controller-level query check `Favorite.findOne({ user, cafe })` before inserts.

### Q5: How do you handle JWT verification in Express?
> **A**: Inside `middleware/authMiddleware.js`, the `protect` middleware reads the `Authorization` header (`Bearer <token>`), verifies the signature via `jwt.verify(token, JWT_SECRET)`, fetches the corresponding user from the database minus the password, and attaches it as `req.user` to pass down to downstream handlers.

---

## 🎤 Project Presentation Points
1. **Design First approach**: Impress viewers with curated coffee themes, glass elements, transitions, and layout cards.
2. **Precision Scoring**: Users don't just rate 1-5 stars overall. They rate 6 pillars, yielding custom vibe recommendations (Study, Work, Date, etc.).
3. **Database Performance**: All ratings are recalculated via MongoDB Aggregation Pipelines in a single database roundtrip on change.
4. **Clean Session Guards**: JWT credentials persist in localStorage, providing smooth auth-guards and redirects.
