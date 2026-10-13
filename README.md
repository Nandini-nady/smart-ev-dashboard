# ⚡ SmartEV Ops - EV Charging Station Analytics Dashboard

A full-stack, real-time analytics and management platform built for monitoring EV charging infrastructure across Telangana network hubs (HITEC City, Gachibowli, Jubilee Hills, RGIA, Warangal).

## 🛠 Tech Stack
- **Backend**: Spring Boot 3, Java 21, Spring Data JDBC
- **Database**: MySQL (`ev_charging_db`)
- **Frontend**: HTML5, CSS Grid & Flexbox, JavaScript (ES6+), Chart.js
- **Ports**: Spring Boot REST API (`8081`), Live Server UI (`5500`)

## 📊 Core Features
- **Overview Dashboard**: Real-time KPI metrics (Total Stations, Active Chargers, Revenue, Energy Delivered) alongside interactive Chart.js visualizations.
- **Stations & Chargers Management**: Detailed station-by-station table with live availability badges.
- **Revenue Analytics**: Payment transaction tracking with billing statuses and payment methods.

## 🚀 Getting Started

### 1. Database Configuration
Ensure MySQL is running and execute your schema/seed scripts to set up `ev_charging_db`.

### 2. Run the Spring Boot Backend
Navigate to `backend/` and launch `EvDashboardApplication.java` (Server runs on `http://localhost:8081`).

### 3. Launch the Frontend
Open `dashboard/index.html` using Live Server or directly in your browser (`http://127.0.0.1:5500/dashboard/index.html`).
