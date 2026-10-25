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

## 📄 API Documentation

When running in the `Development` environment, OpenAPI documentation is available:
* **OpenAPI endpoint:** `http://localhost:<port>/openapi/v1.json`
* **HTTP Scratchpad:** Use `Web/Backend.http` in your IDE to test API endpoints directly.
