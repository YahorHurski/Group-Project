# Online Store Management Web Application
> **E-Commerce Web Application / Platforma do zarządzania sklepem internetowym**

[![.NET](https://img.shields.io/badge/.NET-10.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

---

## 📌 Project Overview

This project is an e-commerce web application designed and developed as part of the academic curriculum for the **"Projekt zespołowy" (Team Project)** laboratory course.

* **Institution:** Częstochowa University of Technology (*Politechnika Częstochowska*)
* **Faculty:** Faculty of Computer Science and Artificial Intelligence (*Wydział Informatyki i Sztucznej Inteligencji*)
* **Department:** Department of Computer Science (*Katedra Informatyki*)
* **Academic Year:** 2026 / 2027
* **Group:** 2 | **Team:** `IO_2`
* **Topic:** Design and implementation of a web application for online store management (*Projektowanie i implementacja aplikacji webowej do zarządzania sklepem*).

The primary goal of the system is to provide a complete, containerized, client-server web solution for online shopping, product browsing, cart management, and administrative order/catalog processing.

---

## 👥 Team Members & Responsibilities

| Member | Role | Core Responsibility |
|---|---|---|
| **Yahor Hurski** | Project Lead (*Kierownik projektu*) | Authentication, authorization, JWT tokens, and user management (`User`, `Role`). |
| **Nazar Koretskyi** | Team Developer | Product catalog and administrative management (`Product`, `Category`, CRUD operations). |
| **Stepan Tarasevych** | Team Developer | Cart, checkout, and order fulfillment (`Cart`, `CartItem`, `Order`, `OrderItem`). |

---

## 🚀 Tech Stack

### Frontend
* **Framework:** [React 19](https://react.dev/)
* **Build Tool:** [Vite](https://vite.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Linter:** [Oxlint](https://oxc.rs/)

### Backend
* **Runtime & Framework:** [.NET 10 (ASP.NET Core Web API)](https://dotnet.microsoft.com/)
* **Language:** C# 13
* **ORM:** [Entity Framework Core 10](https://learn.microsoft.com/en-us/ef/core/)
* **Database Provider:** [Npgsql Entity Framework Core PostgreSQL Provider](https://www.npgsql.org/efcore/)
* **Object Mapping:** [AutoMapper](https://automapper.io/)
* **API Documentation:** OpenAPI (Scalar / Swagger)

### Database & DevOps
* **Database:** PostgreSQL 16 (Alpine)
* **Database GUI:** pgAdmin 4
* **Containerization:** Docker & Docker Compose
* **Version Control:** Git & GitHub

---

## 🎨 UI / UX Philosophy

The user interface is built with modern usability standards in mind:
* **Responsive Design:** Mobile-first, fully responsive layouts powered by Tailwind CSS v4, supporting mobile, tablet, and desktop viewports.
* **Intuitive Navigation:** Quick access to the product catalog, category filters, interactive search bar, shopping cart summary, and user profile.
* **User Feedback:** Clear loading indicators, accessible toast notifications for cart actions (add, remove, quantity update), and user-friendly error messages.
* **Separation of Concerns:** Distinct views and controls for standard customers vs. administrators:
  * **Customer View:** Fast catalog browsing, filters, product details, seamless cart manipulation, and single-click order placement.
  * **Admin Panel:** Product/category CRUD forms, stock management, and order status update interfaces.

---

## 🔒 Security & Data Integrity

* **Password Security:** Passwords are never stored in plain text; secure password hashing algorithms (e.g., PBKDF2 / BCrypt / Argon2) are enforced.
* **Authentication:** Stateless authentication using cryptographically signed **JSON Web Tokens (JWT)** passed via HTTP `Authorization: Bearer <token>` headers.
* **Role-Based Access Control (RBAC):** Explicit separation of permissions between `User` and `Admin` roles. Administrative endpoints (product/category modifications, order status overrides) are inaccessible to unauthorized users.
* **Input Validation:** Strict server-side validation on all incoming DTO requests to prevent injection, tampering, and invalid model states.
* **Database Integrity:** Foreign key relationships, unique constraints (e.g., unique customer email index), and decimal currency precision enforced at the PostgreSQL database level.

---

## 📋 Functional Requirements

### Must-Have Requirements
1. **Authentication & Authorization:** User registration, login, JWT token issuance and validation, protected routes according to roles (`User` / `Admin`).
2. **Product Catalog & Management:** Public catalog browsing and search; administrative CRUD operations for products and categories.
3. **Cart & Order Processing:** Adding/removing items from cart, quantity adjustment, real-time total price calculation, placing orders, order history for users, and status tracking (`Pending`, `Processing`, `Completed`, `Cancelled`).

### Nice-to-Have Requirements (Extensions)
* **Wishlist:** Favorite products saved per authenticated user.
* **Reviews & Ratings:** Customer product ratings and feedback with average rating calculations.
* **Advanced Catalog Tools:** Multi-criteria filtering, sorting (price, date, name), and server-side pagination.

---

## 📁 Project Structure

```
Group-Project/
├── docker-compose.yml              # Container orchestration
├── docs/                           # Project documentation
│   ├── project-card.pdf            # Project Charter
│   └── diagrams/
│       └── orm-diagram.png         # Database ER diagram
│
├── Backend/                        # Backend REST API
│   ├── Backend.csproj              # Project configuration
│   ├── DAL/                        # Data Access Layer
│   ├── Model/                      # Domain Entities
│   ├── Services/                   # Business Logic Layer
│   │   ├── DTOs/                   # Data Transfer Objects
│   │   ├── Mapping/                # Mapping profiles
│   │   └── Common/                 # Shared utilities and constants
│   └── Web/                        # API host and presentation layer
│       ├── Controllers/            # API Controllers
│       ├── Properties/             # Launch settings
│       ├── appsettings.json        # Application configuration
│       ├── appsettings.Development.json
│       ├── Backend.http            # HTTP test requests
│       └── Program.cs              # Application entry point
│
└── Frontend/                       # Frontend application
    ├── index.html                  # HTML entry point
    ├── vite.config.js              # Bundler configuration
    ├── package.json                # Dependencies and scripts
    └── src/
        ├── assets/                 # Static assets
        ├── components/             # Reusable UI components
        ├── pages/                  # Page components
        ├── services/               # API service layer
        ├── context/                # State context providers
        ├── hooks/                  # Custom hooks
        ├── utils/                  # Helper utilities
        ├── App.jsx                 # Root component
        ├── main.jsx                # Application root
        └── index.css               # Global stylesheet
```

---

## ⚙️ Getting Started

### Prerequisites

Ensure the following tools are installed on your workstation:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Docker Compose)
* [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* [Node.js](https://nodejs.org/) (version 20 LTS or higher recommended)
* [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-organization>/Group-Project.git
cd Group-Project
```

---

### Step 2: Start the Database via Docker Compose
Run the following command in the project root:
```bash
docker compose up -d
```
* **PostgreSQL:** Running on `localhost:5432` (Database: `shop_db`, User: `postgres`, Password: `postgres`)
* **pgAdmin 4 Web GUI:** Accessible at `http://localhost:5050`
  * **Email:** `admin@shop.com`
  * **Password:** `admin`

---

### Step 3: Run the Backend API
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Restore dependencies and run the server:
   ```bash
   dotnet restore
   dotnet run
   ```
3. The API will start locally (typically at `https://localhost:7xxx` or `http://localhost:5xxx`). OpenAPI documentation is accessible in development mode.

---

### Step 4: Run the Frontend
1. Open a new terminal and navigate to `Frontend`:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🗄️ Database Management & Migrations

When models or database structures change, use Entity Framework Core CLI tools inside the `Backend` directory:

```bash
# Add a new migration
dotnet ef migrations add <MigrationName>

# Apply migrations to the PostgreSQL database
dotnet ef database update
```

---

## 📜 License & Acknowledgments
Developed for academic purposes at **Politechnika Częstochowska (Wydział Informatyki i Sztucznej Inteligencji)**. All rights reserved by team `IO_2`.
