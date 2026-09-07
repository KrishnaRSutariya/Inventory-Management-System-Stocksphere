# Database Entity Relationship (ER) Diagram

This document illustrates the normalized relational structure designed for the **StockSphere Inventory Management System**, implemented using MongoDB and Mongoose.

## 1. Visual Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ PRODUCT : "registers / creates"
    USER ||--o{ CATEGORY : "maintains"
    USER ||--o{ INVENTORY_TRANSACTION : "executes adjustment"
    CATEGORY ||--o{ PRODUCT : "classifies"
    PRODUCT ||--o{ INVENTORY_TRANSACTION : "subject to movement"

    USER {
        ObjectId _id PK "Unique identifier"
        string name "User full name"
        string email UK "Unique lowercase email address"
        string password "Bcrypt hashed password (salt=10)"
        string role "ENUM: ADMIN, USER (default: USER)"
        date createdAt "Timestamp of registration"
        date updatedAt "Timestamp of last modification"
    }

    CATEGORY {
        ObjectId _id PK "Unique identifier"
        string name UK "Unique category name"
        string description "Optional functional scope description"
        ObjectId createdBy FK "Reference to USER"
        date createdAt "Creation timestamp"
        date updatedAt "Modification timestamp"
    }

    PRODUCT {
        ObjectId _id PK "Unique identifier"
        string name "Product title"
        string sku UK "Unique uppercase Stock Keeping Unit"
        ObjectId category FK "Reference to CATEGORY"
        string description "Optional detailed item description"
        number quantity "Current stock in units (>= 0)"
        number unitPrice "Price per item (> 0)"
        string supplierName "Primary vendor or vendor distributor"
        number lowStockThreshold "Threshold triggering LOW_STOCK alert (default: 10)"
        string barcode "Optional 1D/2D barcode code string"
        string status VIRTUAL "Dynamically computed: IN_STOCK | LOW_STOCK | OUT_OF_STOCK"
        ObjectId createdBy FK "Reference to USER"
        date createdAt "Date item was added"
        date updatedAt "Date of last modification"
    }

    INVENTORY_TRANSACTION {
        ObjectId _id PK "Unique identifier"
        ObjectId product FK "Reference to subject PRODUCT"
        string type "ENUM: IN (Inward) | OUT (Outward)"
        number quantity "Amount of units transferred (> 0)"
        number previousQuantity "Inventory balance prior to transaction"
        number newQuantity "Inventory balance resulting from transaction"
        string note "Audit reason (e.g. Purchase, Sale, Damaged write-off)"
        ObjectId createdBy FK "Reference to actor USER"
        date createdAt "Immutable transaction timestamp"
    }
```

---

## 2. Key Database Architecture Decisions

### Dynamic vs. Persisted Stock Status
- **Issue with Persisting Status**: Storing `status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"` as a hard column/field creates a synchronization liability. If stock drops to 0 without updating `status`, reports will report false availability.
- **Solution**: Status is modeled as a virtual property and projected dynamically inside MongoDB aggregation pipelines using the expression:
  ```javascript
  quantity <= 0 ? 'OUT_OF_STOCK' : (quantity <= lowStockThreshold ? 'LOW_STOCK' : 'IN_STOCK')
  ```

### Immutable Transaction Ledger
- Rather than merely incrementing or decrementing `product.quantity`, every stock modification creates an immutable `InventoryTransaction` record.
- Maintains snapshot records of `previousQuantity` and `newQuantity`, ensuring an unbroken audit trail for warehouse accounting.

### Referential Integrity Protection
- When deleting a Category, the backend verifies whether any active products are linked to that category ID. If `linkedCount > 0`, the deletion is rejected with an informative HTTP 400 error.
