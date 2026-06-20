# 🇮🇳 AI-Based Government Scheme Hub

A full-stack web application that helps Indian citizens discover eligible government schemes based on their personal profile.

---

## 📋 Features

| Module | Description |
|--------|-------------|
| **User Details Form** | Collect name, age, gender, state, income, occupation, education |
| **AI Recommendation** | Rule-based matching engine suggests eligible schemes |
| **Scheme Browsing** | Search, filter by category, view all schemes |
| **Scheme Details** | Full info – benefits, eligibility, documents, apply link |
| **Saved Schemes** | Bookmark schemes; view/remove anytime |
| **Notifications** | Dashboard alerts for newly added schemes |
| **Admin Panel** | Add new schemes → auto-notifies users |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | SQLite (via better-sqlite3) |
| Styling | Custom CSS (no UI libraries) |

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v16 or above
- npm

---

### Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs at: **http://localhost:5000**

The SQLite database (`scheme_hub.db`) is created automatically on first run and syncs 30 pre-seeded schemes.

---

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create user profile |
| GET | `/api/users/:id` | Get user profile |
| GET | `/api/schemes` | Get all schemes (supports ?search= and ?category=) |
| GET | `/api/schemes/notifications` | Get new scheme notifications |
| GET | `/api/schemes/:id` | Get single scheme |
| POST | `/api/schemes/recommend` | AI-recommend schemes for user profile |
| POST | `/api/schemes` | Add new scheme (Admin) |
| PUT | `/api/schemes/:id` | Update scheme |
| DELETE | `/api/schemes/:id` | Delete scheme |
| GET | `/api/saved/:userId` | Get user's saved schemes |
| POST | `/api/saved` | Save a scheme |
| DELETE | `/api/saved/:userId/:schemeId` | Remove saved scheme |

---

## 🗄️ Database Schema

### `users`
| Column | Type |
|--------|------|
| id | TEXT (UUID) |
| name | TEXT |
| age | INTEGER |
| gender | TEXT |
| state | TEXT |
| category | TEXT (SC/ST/OBC/General) |
| occupation | TEXT |
| annual_income | INTEGER |
| education | TEXT |

### `schemes`
| Column | Type |
|--------|------|
| id | TEXT |
| name | TEXT |
| description | TEXT |
| ministry | TEXT |
| benefits | TEXT |
| eligibility | TEXT |
| documents | TEXT |
| apply_link | TEXT |
| category | TEXT |
| min_age / max_age | INTEGER |
| gender | TEXT |
| min_income / max_income | INTEGER |
| is_new | INTEGER (0/1) |
| date_added | TEXT |

### `saved_schemes`
| Column | Type |
|--------|------|
| id | INTEGER (auto) |
| user_id | TEXT |
| scheme_id | TEXT |
| saved_at | TEXT |

---

## 📁 Project Structure

```
scheme-hub/
├── backend/
│   ├── server.js          # Express entry point
│   ├── db.js              # SQLite init + seeding
│   ├── recommendation.js  # AI matching engine
│   ├── routes/
│   │   ├── users.js
│   │   ├── schemes.js
│   │   └── savedSchemes.js
│   └── package.json
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── context/AppContext.js
    │   ├── components/
    │   │   ├── Navbar.js + .css
    │   │   ├── SchemeCard.js + .css
    │   │   └── Toast.js
    │   ├── pages/
    │   │   ├── Home.js + .css
    │   │   ├── Recommendations.js + .css
    │   │   ├── Schemes.js + .css
    │   │   ├── SchemeDetail.js + .css
    │   │   ├── SavedSchemes.js + .css
    │   │   └── Admin.js + .css
    │   └── styles/global.css
    └── package.json
```

---

## 🔧 How the Recommendation Engine Works

The engine in `backend/recommendation.js` uses rule-based scoring:

1. **Hard Filters** (must match): Age range, Gender, Income range
2. **Soft Scoring** (+points for): Occupation match, Education match, SC/ST category
3. **Sort** by score (highest first)

---

## 📌 Pre-loaded Schemes (30 schemes)

1. PM Kisan Samman Nidhi
2. PM Internship Scheme *(NEW)*
3. Free Laptop Scheme (PM Vidhyalaxmi) *(NEW)*
4. PM Awas Yojana
5. Beti Bachao Beti Padhao
6. PM Mudra Yojana
7. Ayushman Bharat PM-JAY
8. Solar Pump Scheme (PM-KUSUM) *(NEW)*
9. National Scholarship Portal
10. Stand-Up India
11. PM SVANidhi
12. Sukanya Samriddhi Yojana

---

## 👨‍💻 Development Notes

- User profile is stored in `localStorage` for persistence
- Notifications auto-refresh from backend on page load
- Admin can toggle scheme "NEW" status which controls notification visibility
- All API calls use Axios with React proxy set to `http://localhost:5000`
