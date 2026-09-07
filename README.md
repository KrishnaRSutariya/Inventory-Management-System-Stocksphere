# StockSphere — Enterprise Inventory Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A scalable, responsive, full-stack Inventory Management System built with a **modular Node.js/Express + TypeScript** backend, a **feature-based React + Vite + TypeScript** frontend, and **MongoDB**. 

---

## 🌟 Key Features

### 1. Secure Authentication & Role-Based Access Control (RBAC)
- **Hybrid Security**: Sets secure `httpOnly` session cookies and simultaneously returns JWT `accessToken` in the response body for maximum client flexibility (XSS-safe cookies + Bearer token fallback).
- **Roles**:
  - `ADMIN`: Full control over products, categories, stock adjustments, CSV imports/exports, and system configuration.
  - `USER` (Staff): Access to dashboard metrics, product catalog viewing, stock adjustments (`IN`/`OUT`), and audit ledger exploration.

### 2. High-Performance Dashboard & Real-Time Analytics
- **Live KPIs**: Total Products, Total Categories, Total Stock Quantity, Low Stock Items, Out of Stock Items, and Total Inventory Valuation.
- **Visual Analytics with Recharts**:
  - Category Volume Bar Chart (Units & Total Value by Category).
  - Health Status Donut Chart (In Stock vs. Low Stock vs. Out of Stock).
  - Live Stream of recent inventory movements.

### 3. Product Catalog & Inventory Tracking (CRUD)
- **Complete Product Fields**: Name, SKU (Unique uppercase), Category, Description, Quantity ($\ge 0$), Unit Price ($> 0$), Supplier Name, Low Stock Threshold, Barcode, Date Added, Last Updated.
- **Dynamic Stock Status Calculation**: Computed dynamically in real-time (and projected in MongoDB aggregations) to avoid data inconsistency:
  - `quantity === 0` $\rightarrow$ `OUT_OF_STOCK`
  - `quantity <= lowStockThreshold` $\rightarrow$ `LOW_STOCK`
  - `quantity > lowStockThreshold` $\rightarrow$ `IN_STOCK`
- **Filtering & Search**:
  - Debounced search (400ms) across product name, SKU, and supplier name.
  - Category filter dropdown.
  - Stock status pill tabs.
  - Multi-column sorting (Name, Quantity, Unit Price, Created Date).
  - Full pagination with customizable page size (5, 10, 25, 50).
  - State synchronized seamlessly with URL search parameters for link sharing.

### 4. Double-Entry Stock Movement Ledger & Audit Trail
- **Atomic Stock Adjustments**: Supports both **STOCK IN** (Inward / Restock) and **STOCK OUT** (Outward / Dispatch).
- **Negative Stock Prevention**: Server and client strictly prevent stock reductions that would result in negative inventory balances.
- **Immutable Transaction Records**: Every adjustment captures `product`, `type`, `quantity`, `previousQuantity`, `newQuantity`, `note`, `createdBy`, and `timestamp`.

### 5. Category Management
- Create, edit, and view categories with real-time product counts.
- **Referential Integrity**: Prevents accidental deletion of categories that have assigned products.

### 6. Bonus Features Included
- 📊 **Interactive Recharts Analytics**: Category distribution and status breakdown.
- 📥 **CSV Export**: Stream filtered product catalogs to downloadable CSV files.
- 📤 **CSV Bulk Import**: Upload spreadsheet files with row-by-row validation reports.
- 🏷️ **Barcode & QR Code Visualizer**: Scannable Code128 barcodes and 2D QR codes with printable label modal.
- 🌙 **Dark Mode Support**: Persistent dark/light theme switch.
- 📖 **Interactive Swagger / OpenAPI 3.0 Documentation**: Served live at `/api-docs`.
- 📮 **Postman Collection**: Included at `docs/postman_collection.json`.
- 🐳 **Docker & Docker Compose**: Multi-container setup with MongoDB, Node server, and Nginx SPA client.
- 🧪 **Automated Testing Suite**: Backend unit tests using Vitest.

---

## 🏗️ Architecture & Folder Structure

```
inventory-management-system/
│
├── client/                     # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── app/                # App wrapper, Router, Providers
│   │   ├── components/
│   │   │   ├── ui/             # Button, Input, Modal, Table, Badge, Card, Loader
│   │   │   ├── layout/         # DashboardLayout, Sidebar, Header, ThemeToggle
│   │   │   └── common/         # StatusBadge, EmptyState, ErrorState, SearchInput
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── features/           # Feature-based modular structure
│   │   │   ├── auth/           # Login & Register forms, schemas, API
│   │   │   ├── dashboard/      # KPI cards, Recharts components
│   │   │   ├── products/       # ProductTable, Filters, Modals, CSV export/import
│   │   │   ├── categories/     # CategoryTable, CategoryFormModal
│   │   │   └── inventory/      # StockAdjustmentModal, TransactionLedgerTable
│   │   ├── hooks/              # useDebounce, custom hooks
│   │   ├── lib/                # Axios instance, QueryClient, formatters
│   │   └── pages/              # Routed pages
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                     # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── common/             # Errors, middlewares, utils, constants
│   │   ├── config/             # DB connector, env config, swagger loader
│   │   ├── docs/               # OpenAPI 3.0 YAML specification
│   │   ├── modules/            # Modular domain architecture
│   │   │   ├── auth/           # Controller, Service, Validation, Routes
│   │   │   ├── users/          # Model, Types
│   │   │   ├── categories/     # Controller, Service, Validation, Routes, Model
│   │   │   ├── products/       # Controller, Service, Validation, Routes, Model
│   │   │   ├── inventory/      # Stock adjustment, Audit Transaction model
│   │   │   └── dashboard/      # Aggregation metrics service & controller
│   │   ├── routes/             # Versioned route registry (/api/v1)
│   │   ├── scripts/            # Database seed script
│   │   ├── app.ts              # Express configuration
│   │   └── server.ts           # Server bootstrap
│   ├── tests/                  # Vitest unit test suites
│   └── Dockerfile
│
├── docs/                       # Project Documentation & Artifacts
│   ├── swagger.yaml            # OpenAPI 3.0 specification
│   ├── postman_collection.json # Exported Postman collection
│   └── ER_DIAGRAM.md           # Database ER diagram in Mermaid
│
├── docker-compose.yml          # Multi-container orchestration
├── package.json                # Root package with concurrent dev scripts
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ or v22 LTS recommended)
- [MongoDB](https://www.mongodb.com/) running locally on `localhost:27017` (or MongoDB Atlas connection string)
- [Docker](https://www.docker.com/) (Optional for containerized run)

### Option 1: Local Development (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Both `client/` and `server/` include pre-configured `.env` and `.env.example` files:
   - Backend `server/.env`:
     ```env
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://localhost:27017/inventory_management
     JWT_SECRET=super_secret_jwt_key_inventory_redsoft_2026
     JWT_EXPIRES_IN=7d
     CLIENT_URL=http://localhost:5173
     ```
   - Frontend `client/.env`:
     ```env
     VITE_API_URL=http://localhost:5000/api/v1
     ```

4. **Seed the Database with realistic sample data**:
   ```bash
   npm run seed
   ```
   *Creates default Admin & Staff accounts, 5 product categories, 18 diverse products across all stock levels, and 36 historical audit transactions.*

5. **Start both backend and frontend concurrently**:
   ```bash
   npm run dev
   ```
   - **Frontend Application**: `http://localhost:5173`
   - **Backend REST API**: `http://localhost:5000/api/v1`
   - **Interactive Swagger Docs**: `http://localhost:5000/api-docs`

---

### Option 2: Run with Docker Compose

To launch the complete stack (MongoDB + Server + Client) in isolated containers:
```bash
docker-compose up --build
```
Access the application at `http://localhost:5173`.

---

## 🔑 Default Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@inventory.com` | `Admin123!` | Full Access (CRUD Products, Categories, Stock Adjustments, CSV) |
| **Warehouse Staff** | `staff@inventory.com` | `Staff123!` | Read catalog, adjust stock inward/outward, view audit ledger |

*(One-click demo login buttons are provided on the `/login` screen for fast evaluation).*

---

## 📚 REST API Reference (`/api/v1`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue cookie / JWT | Public |
| `POST` | `/api/v1/auth/logout` | Clear session cookie | Authenticated |
| `GET` | `/api/v1/auth/me` | Fetch profile of current user | Authenticated |
| `GET` | `/api/v1/dashboard` | Aggregated inventory statistics & analytics | Authenticated |
| `GET` | `/api/v1/products` | List products with search, filters, pagination | Authenticated |
| `POST` | `/api/v1/products` | Create product (unique SKU check) | Authenticated |
| `GET` | `/api/v1/products/:id` | Fetch product details by ID | Authenticated |
| `PATCH` | `/api/v1/products/:id` | Update product information | Authenticated |
| `DELETE` | `/api/v1/products/:id` | Delete product and linked transactions | Admin |
| `GET` | `/api/v1/products/export/csv` | Export filtered inventory to CSV download | Authenticated |
| `POST` | `/api/v1/products/import/csv` | Bulk import products from CSV spreadsheet | Admin |
| `GET` | `/api/v1/categories` | List categories with product counts | Authenticated |
| `POST` | `/api/v1/categories` | Create new category | Authenticated |
| `PATCH` | `/api/v1/categories/:id` | Update category | Authenticated |
| `DELETE` | `/api/v1/categories/:id` | Delete category (blocked if products linked)| Admin |
| `POST` | `/api/v1/inventory/:productId/adjust` | Adjust stock level (`IN` or `OUT`) | Authenticated |
| `GET` | `/api/v1/inventory/:productId/history` | Get product-specific transaction history | Authenticated |
| `GET` | `/api/v1/inventory/transactions` | Global inventory audit movement ledger | Authenticated |

Interactive API documentation with request schemas and live testing is accessible at **`http://localhost:5000/api-docs`**.

---

## 🧪 Testing & Verification

Run automated backend unit tests:
```bash
npm --prefix server run test
```
Verifies:
- Dynamic stock status calculation engine (`calculateStockStatus`).
- Zod schema validation (uppercase SKU transformation, positive price requirement, negative quantity rejection).
- Stock adjustment rules.

---

## 💡 Assumptions & Architectural Trade-offs

1. **Dynamic Stock Status vs. Hardcoded Storage**:
   - *Trade-off*: Calculating status dynamically on retrieval and projecting it via aggregation pipelines requires a small compute overhead versus reading a static string.
   - *Rationale*: Eliminates desynchronization bugs where `quantity` changes but `status` fails to update. It guarantees 100% data consistency.

2. **Immutable Transaction Ledger**:
   - *Trade-off*: Every stock change creates a new record in `InventoryTransaction`, consuming additional storage.
   - *Rationale*: Provides true warehouse accountability. Management can answer who modified an item, when, why, and what the stock level was before and after.

3. **Hybrid Authentication**:
   - *Trade-off*: Sending both an HTTP-only cookie and a JWT token in the JSON response payload.
   - *Rationale*: HTTP-only cookies prevent XSS theft in web browsers, while Bearer authorization headers provide seamless compatibility with external clients, mobile apps, and Postman.
