# Backend API — Online Store Management

> RESTful API built with **ASP.NET Core (.NET 10)**, **Entity Framework Core**, and **PostgreSQL**.

[![.NET](https://img.shields.io/badge/.NET-10.0-purple.svg)](https://dotnet.microsoft.com/)
[![EF Core](https://img.shields.io/badge/EF_Core-10.0-512bd4.svg)](https://learn.microsoft.com/en-us/ef/core/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![AutoMapper](https://img.shields.io/badge/AutoMapper-16.2-red.svg)](https://automapper.io/)

---

## 📖 Overview

The Backend service serves as the core business logic and data persistence engine for the Online Store Management web application. It exposes a secure REST API consumed by the React client application, handling authentication, catalog management, shopping cart operations, and order processing.

---

## 🏛️ Architecture

The backend follows a clean, layered architecture with separation of concerns:

* **Web Layer (`Web/`):** API controllers, HTTP request handling, endpoint routing, middleware, application configuration, and dependency injection setup.
* **Services Layer (`Services/`):** Business logic, service interfaces and implementations, Data Transfer Objects (`DTOs`), AutoMapper mapping profiles (`Mapping`), and shared utilities (`Common`).
* **Domain Model Layer (`Model/`):** Core business entities and domain models (`User`, `Product`, `Category`, `Order`, `Cart`).
* **Data Access Layer (`DAL/`):** Database context (`DbContext`), Entity Framework Core mappings, relationship configurations, and database migrations.

---

## 📁 Project Structure

```
Backend/
├── Backend.csproj                  # Project configuration and package dependencies
├── DAL/                            # Data Access Layer
├── Model/                          # Domain entities
├── Services/                       # Business logic and services
│   ├── DTOs/                       # Data Transfer Objects
│   ├── Mapping/                    # AutoMapper profiles
│   └── Common/                     # Shared utilities and constants
└── Web/                            # API host and presentation layer
    ├── Controllers/                # API Controllers
    ├── Properties/                 # Launch settings
    ├── appsettings.json            # Application configuration and connection strings
    ├── appsettings.Development.json
    ├── Backend.http                # HTTP request tests
    └── Program.cs                  # Application entry point and DI configuration
```

---

## 📦 Installed Packages

| Package | Version | Purpose |
|---|---|---|
| `Npgsql.EntityFrameworkCore.PostgreSQL` | `10.0.3` | PostgreSQL provider for Entity Framework Core |
| `Microsoft.EntityFrameworkCore.Design` | `10.0.14` | EF Core tooling for creating and running migrations |
| `AutoMapper` | `16.2.0` | Object-to-object mapping between Entities and DTOs |
| `Microsoft.AspNetCore.OpenApi` | `10.*` | OpenAPI specification generation |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | `10.*` | JWT bearer authentication |

---

## 🔐 Authentication & Authorization

JWT bearer authentication with two roles: `User` (default for new accounts) and `Admin`. Passwords are stored only as hashes (ASP.NET Core `PasswordHasher`).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | public | Create an account (`email`, `password` ≥ 8 chars). `201` + JWT, `409` if the email exists, `400` on invalid data |
| `POST` | `/api/auth/login` | public | Log in. `200` + JWT, `401` on wrong credentials |
| `GET` | `/api/auth/me` | any authenticated user | Current user |
| `GET` | `/api/admin/users` | `Admin` only | List users (`401` without a token, `403` for role `User`) |

Send the token as `Authorization: Bearer <token>`.

**Configuration** (`Web/appsettings*.json`, overridable with environment variables such as `Jwt__Key`):

* `Jwt:Key` — signing key, at least 32 bytes. Empty in `appsettings.json` (the API refuses to start without it); a development key is set in `appsettings.Development.json`. Always set a secret key outside development.
* `SeedAdmin:Email` / `SeedAdmin:Password` — initial administrator created on startup if missing (development: `admin@shop.com` / `Admin123!`).
* `Database:MigrateOnStartup` — apply EF Core migrations on startup (default `true`).

---

## ⚙️ Configuration & Environment

The database connection string is configured in **`Web/appsettings.json`** and **`Web/appsettings.Development.json`**:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=shop_db;Username=postgres;Password=postgres"
  }
}
```

* Ensure the PostgreSQL instance is running (via Docker Compose in the project root: `docker compose up -d db`).

---

## 🚀 Getting Started

### Prerequisites
* [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
* Running PostgreSQL database instance

### Build & Run

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Restore NuGet dependencies:
   ```bash
   dotnet restore
   ```

3. Build the project:
   ```bash
   dotnet build
   ```

4. Run the API:
   ```bash
   dotnet run
   ```

The application will launch and listen on the configured local ports (specified in `Web/Properties/launchSettings.json`).

---

## 🗄️ Database Migrations

Use the .NET EF CLI tools from the `Backend` folder to manage database schema updates:

```bash
# Create a new migration
dotnet ef migrations add <MigrationName>

# Apply pending migrations to the database
dotnet ef database update

# Remove the last migration (if not yet applied)
dotnet ef migrations remove
```

---

## 🛍️ Catalog API (products & categories)

Reads are public; create/update/delete require the `Admin` role (`401` without a token, `403` for role `User`).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | public | All categories (sorted by name) |
| `GET` | `/api/categories/{id}` | public | One category, `404` if missing |
| `POST` | `/api/categories` | `Admin` | Create (`name` ≤ 100). `409` on duplicate name |
| `PUT` | `/api/categories/{id}` | `Admin` | Rename. `404` / `409` |
| `DELETE` | `/api/categories/{id}` | `Admin` | `204`; `409` if the category still has products |
| `GET` | `/api/products?search=&categoryId=` | public | Products; optional case-insensitive `search` (name/description) and `categoryId` filter |
| `GET` | `/api/products/{id}` | public | One product, `404` if missing |
| `POST` | `/api/products` | `Admin` | Create. `400` on invalid data or unknown `categoryId` |
| `PUT` | `/api/products/{id}` | `Admin` | Update. `400` / `404` |
| `DELETE` | `/api/products/{id}` | `Admin` | `204`; `409` if the product is part of existing orders |

Product body: `name` (1–200), `description` (≤ 2000, optional), `price` (0 – 1 000 000 000), `stockQuantity` (≥ 0), `categoryId`. Validation errors return `400` with a per-field `errors` object; other failures return `ProblemDetails` (`title`, `detail`).

---

## 📄 API Documentation

When running in the `Development` environment, OpenAPI documentation is available:
* **OpenAPI endpoint:** `http://localhost:<port>/openapi/v1.json`
* **HTTP Scratchpad:** Use `Web/Backend.http` in your IDE to test API endpoints directly.
