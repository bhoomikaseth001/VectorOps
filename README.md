# TransitOps

**A fleet operations platform built for a hackathon in under 8 hours.**

TransitOps helps a transport/logistics business manage its vehicles, drivers, trips,
maintenance, and expenses in one place — instead of juggling spreadsheets and phone calls.

---

## What is this? (for anyone, technical or not)

Imagine you run a small trucking or delivery company. Every day you need to know:

- Which vehicles are free, on a trip, or in the repair shop?
- Which drivers are available, and are their licenses still valid?
- Where is each trip going, who's driving it, and what's it carrying?
- How much are you spending on fuel, tolls, and repairs?

TransitOps is a web dashboard that answers all of that at a glance. Different people
on the team see different things depending on their job:

| Role | What they can do |
|---|---|
| **Fleet Manager** | Sees and manages everything — vehicles, drivers, trips, maintenance, expenses, reports |
| **Driver** | Sees their own assigned trips |
| **Safety Officer** | Manages vehicles, drivers, and maintenance records |
| **Financial Analyst** | Manages fuel logs, expenses, and financial reports |

Each person logs in with their own account, and the app only shows them what's
relevant to their role — a driver doesn't get cluttered with financial reports, and
a financial analyst doesn't need to see maintenance schedules.

---

## What is this? (for developers)

TransitOps is a full-stack web app: a **React** single-page app talking to an
**Express + MySQL (Sequelize)** REST API, with JWT-based authentication and
role-based access control (RBAC).

### Tech stack

**Frontend (`/client`)**
- React 18 + Vite
- React Router v6 (routing, protected routes, role guards)
- Tailwind CSS (styling)
- Axios (API calls, with a shared instance + interceptors for auth)
- lucide-react (icons)

**Backend (`/server`)**
- Node.js + Express
- Sequelize ORM + MySQL
- JWT for authentication
- bcrypt for password hashing

### Project structure

```
TransitOps/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/                # One file per backend resource (axios calls)
│   │   │   ├── client.js         # Shared axios instance, attaches JWT, handles 401s
│   │   │   ├── auth.js
│   │   │   ├── vehicles.js
│   │   │   ├── drivers.js
│   │   │   ├── trips.js
│   │   │   ├── maintenance.js
│   │   │   ├── fuelExpense.js
│   │   │   └── reports.js
│   │   ├── assets/              # Images, icons, static files
│   │   ├── components/
│   │   │   ├── layout/            # Sidebar, Topbar, AppLayout (page shell)
│   │   │   └── ui/                 # Reusable UI: Button, Card, Table, Badge, Modal, Input...
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Login/signup/logout, current user, role checks
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx # Auth guard + role (RBAC) guard
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Signup
│   │   │   ├── dashboard/           # KPI overview
│   │   │   ├── vehicles/            # Vehicle registry (add/edit)
│   │   │   ├── drivers/             # Driver management (add/edit)
│   │   │   ├── trips/               # Trip dispatch + list
│   │   │   ├── maintenance/         # Maintenance records
│   │   │   ├── expenses/            # Fuel logs + expenses
│   │   │   ├── reports/             # Analytics / reports
│   │   │   ├── NotFound.jsx
│   │   │   └── Unauthorized.jsx
│   │   ├── App.jsx              # Route definitions
│   │   └── main.jsx             # App entry point
│   └── package.json
│
└── server/                    # Express backend
    ├── config/
    │   └── db.js                # Sequelize + MySQL connection
    ├── controllers/            # Request handlers (one per resource)
    ├── middleware/
    │   └── auth.js               # JWT verification, role checks
    ├── models/                 # Sequelize models (database schema)
    │   ├── User.js                # name, email, password, role, status
    │   ├── Vehicle.js             # registrationNumber, name, type, capacity, status...
    │   ├── Driver.js              # name, license info, safety score, status
    │   ├── Trip.js                # source, destination, cargo, distance, status...
    │   ├── Maintenance.js         # description, cost, status, dates
    │   ├── FuelLog.js             # liters, cost, date
    │   ├── Expense.js             # type, amount, notes, date
    │   └── index.js               # Model associations (foreign keys between tables)
    ├── routes/                 # Express route definitions (URL → controller mapping)
    ├── server.js                # App entry point
    └── package.json
```

### How authentication & roles work

1. A user signs up or logs in via `/api/auth/signup` or `/api/auth/login`.
2. The server returns a JWT plus the user's profile (`{ id, name, email, role }`).
3. The frontend stores the token and attaches it to every API request automatically
   (see `client/src/api/client.js`).
4. If a request comes back `401 Unauthorized`, the frontend logs the user out and
   redirects to `/login`.
5. On the frontend, `ProtectedRoute` blocks anyone without a valid session, and
   `RoleRoute` further restricts pages by role (e.g. only `FleetManager` and
   `SafetyOfficer` can see `/vehicles`).
6. The sidebar navigation itself is also filtered by role, so users never even see
   links to pages they can't access.

### Getting it running locally

**1. Backend**
```bash
cd server
npm install
cp .env.example .env   # fill in your MySQL credentials + JWT secret
npm run dev
```
You should see `MySQL connected & tables synced` and `Server running on port 5000`.

**2. Frontend**
```bash
cd client
npm install
cp .env.example .env   # set VITE_API_URL if your server isn't on localhost:5000
npm run dev
```
Open the printed `localhost` URL (typically `http://localhost:5173`).

**3. Try it out**
- Sign up with a role of your choice (e.g. `FleetManager`) to see the full app.
- Sign up again with a different role (e.g. `Driver`) in a private/incognito window
  to see how the experience changes.

---

## Core features

- 🔐 **Authentication & RBAC** — secure login/signup, four distinct roles, each with
  its own view of the app.
- 🚚 **Vehicle Registry** — add, edit, and track every vehicle's status (Available,
  On Trip, In Shop, Retired), load capacity, and odometer.
- 🧑‍✈️ **Driver Management** — track licenses, expiry dates, safety scores, and
  availability.
- 🗺️ **Trip Dispatch** — create trips with vehicle/driver dropdowns that only show
  what's actually available, so you can't accidentally double-book a vehicle or
  driver.
- 🔧 **Maintenance Log** — track service history and cost per vehicle.
- ⛽ **Fuel & Expense Tracking** — log fuel purchases and other costs (tolls, etc.)
  per vehicle.
- 📊 **Dashboard & Reports** — KPI overview of fleet activity, with room to grow into
  charts (utilization, ROI, fuel efficiency).

---

## Known limitations / what we'd do with more time

- Trip filtering for the `Driver` role currently matches by name rather than a
  proper `driverId` link between the `User` and `Driver` tables — a real foreign key
  would replace this.
- Dashboard KPIs and reports fall back to placeholder data until the reporting
  endpoints are fully wired up.
- No automated tests yet (hackathon time constraints) — would add API and component
  tests next.
- Dark mode is scaffolded (Tailwind `darkMode: 'class'`) but not yet toggleable in
  the UI.

---

## Authors

Built by **Bhoomika Seth** and **Arnav Singh**.