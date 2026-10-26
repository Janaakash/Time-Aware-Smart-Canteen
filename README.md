# TIME-AWARE SMART CANTEEN

An Intelligent Food Ordering, Queue Estimation, Smart Meal Recommendation, and Pickup Scheduling System for College Canteens.

Built with React (Vite), Node.js, Express, Socket.IO, and MongoDB.

---

## 🌟 Upgraded Time-Aware Features

1. **My Lunch Time Calculator**:
   - Students input break duration (10, 15, 20, 30, 45 mins or custom) or next class time (e.g. 12:30 PM).
   - Automatically calculates available break time in local timezone and max recommended prep time.
   - Highlights remaining free break time after food collection.

2. **Smart Meal Recommendations ("Recommended for Your Break")**:
   - Recommends foods that realistically fit within student's available lunch break and optional budget.
   - Displays preparation time, estimated queue delay, total collection time, fit badge (`FIT`, `TIGHT`, `EXCEEDS`), and rationale.

3. **Queue & Waiting Time Estimation Service**:
   - Centralized backend rule-based engine (`timeService.js`).
   - Accounts for active orders in kitchen, item prep durations, and parallel kitchen prep stations (`kitchenPrepSlots`).
   - Displays workload status (`Low`, `Moderate`, `High`) and estimated wait minutes.

4. **Smart Pickup Scheduling**:
   - Select preferred 10-minute pickup windows during checkout.
   - Server-side capacity enforcement (`maxOrdersPerPickupWindow`) prevents slot overbooking.

5. **Time-Aware Checkout**:
   - Pre-order timing breakdown (Items prep, queue delay, pickup handling).
   - Warning banner if order exceeds student's available break duration.

6. **Staff Kitchen Workload Dashboard**:
   - Real-time kitchen metrics (Pending count, Preparing count, Ready count, Workload delay, Overdue/At-Risk count).
   - Priority queue ordering (At-Risk / Overdue orders listed first).
   - Item-level readiness controls and 1-click delay notification trigger to student via Socket.IO.

7. **Admin Configuration Settings**:
   - Admin settings page (`/admin/settings`) to adjust kitchen prep slots, slot capacity, pickup window duration, opening/closing hours, and delay thresholds.

---

## 📁 Project Structure

- `client/`: React.js (Vite) frontend application.
  - `src/components/LunchTimeCalculator.jsx`: Break duration calculator.
  - `src/components/RecommendedFoods.jsx`: Smart meal recommendation section.
  - `src/context/LunchTimeContext.jsx`: Persistent break state & prediction hook.
  - `src/pages/AdminSettings.jsx`: Administrative canteen capacity settings.
  - `src/pages/StaffOrders.jsx`: Upgraded staff kitchen workload dashboard.
  - `src/pages/Checkout.jsx`: Time-aware checkout with pickup scheduling.
- `server/`: Node.js Express backend.
  - `services/timeService.js`: Centralized estimation, recommendation, and scheduling service.
  - `controllers/timeController.js`: Endpoints for queue status, recommendations, pickup windows.
  - `controllers/adminConfigController.js`: Administrative configuration management.
  - `models/`: Extended `Order`, `FoodItem`, `CanteenConfig`, `User`, `Bill`, `Notification`.
  - `test/`: Verification and unit test suites (`timeService.test.js`, `canteenIntegration.test.js`).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Backend Setup
cd server
npm install

# Frontend Setup
cd ../client
npm install
```

### 2. Environment Variables (.env)
Configured in `server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/smart_canteen
JWT_SECRET=supersecretcanteenkey
PORT=5000
```

### 3. Seed Demo Data & Configuration
```bash
cd server
node seed.js
```

### 4. Run Development Servers
**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

---

## 🔑 Demo User Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@example.com` | `student123` | Akash (Student ID: STU1001) |
| **Staff** | `staff@canteen.com` | `staff123` | Canteen Kitchen Staff |
| **Admin** | `admin@canteen.com` | `admin123` | System Administrator |

---

## 🧪 Testing & Verification

Run backend unit and integration tests:
```bash
# Time calculation tests
node server/test/timeService.test.js

# Comprehensive scenario verification suite
node server/test/canteenIntegration.test.js

# Frontend production build check
cd client && npm run build
```

---

## 🛰️ New & Extended API Endpoints

- `GET /api/time/queue-status`: Get kitchen workload delay metrics.
- `GET /api/time/recommendations`: Get smart food recommendations based on `breakDuration`, `nextClassTime`, `maxBudget`.
- `GET /api/time/pickup-windows`: Get upcoming pickup windows and capacity status.
- `GET /api/admin/config`: Get administrative canteen capacity settings.
- `PUT /api/admin/config`: Update administrative capacity settings (Admin).
- `GET /api/staff/summary`: Get staff kitchen workload summary metrics.
- `PATCH /api/staff/orders/:id/delay`: Flag delay and emit Socket.IO notification to student.
