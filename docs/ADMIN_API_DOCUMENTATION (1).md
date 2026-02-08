# Admin API Documentation

Base URL: `http://<your-domain>/api`

## Admin Authentication

### 1. Admin Sign Up
**Endpoint:** `POST /admin/signup`
**Access:** Public (Should be disabled in production or restricted)

**Request Body:**
```json
{
  "fullName": "Admin User",
  "email": "admin@example.com",
  "password": "strongpassword123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "admin": {
      "id": "60d0...",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "UID": "ADMIN..."
    },
    "token": "jwt_token..."
  }
}
```

---

### 2. Admin Sign In
**Endpoint:** `POST /admin/signin`
**Access:** Public

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "strongpassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "60d0...",
      "email": "admin@example.com",
      "fullName": "Admin User"
    },
    "token": "jwt_token..."
  }
}
```

## Admin Dashboard

**Headers Required:** `Authorization: Bearer <token>` (Admin Token)

### 3. Get Dashboard Data
**Endpoint:** `GET /admin/dashboard`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "active": 50,
      "blocked": 2,
      "newToday": 5
    },
    "investments": {
      "total": 10,
      "totalAmount": 5000
    },
    "wallets": {
      "totalMainBalance": 1000,
      "totalWithdrawable": 500
    },
    "transactions": {
      "today": {
        "deposits": { "count": 2, "total": 200 },
        "withdrawals": { "count": 1, "total": 50 }
      },
      "total": {
        "deposits": { "count": 50, "total": 5000 },
        "withdrawals": { "count": 20, "total": 1000 }
      }
    }
  }
}
```

## User Management

### 4. Get All Users
**Endpoint:** `GET /admin/users`
**Query Params:**
- `page`: 1
- `limit`: 50
- `search`: "john" (searches email, name, UID)
- `isActive`: true/false
- `isBlocked`: true/false
- `rank`: "STAR"
- `sortBy`: "createdAt"
- `sortOrder`: "desc"

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "60d0...",
        "fullName": "John Doe",
        "email": "john@example.com",
        "UID": "EXML...",
        "isActive": true,
        "rank": "STAR"
      }
    ],
    "pagination": { "page": 1, "total": 100, "pages": 2 }
  }
}
```

---

### 5. Get User Details
**Endpoint:** `GET /admin/user/:userId`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "wallet": { ... },
    "investments": [ ... ],
    "transactions": [ ... ],
    "directReferrals": [ ... ]
  }
}
```

---

### 6. Block/Unblock User
**Endpoint:** `PUT /admin/user/:userId/block-unblock`

**Request Body:**
```json
{
  "isBlocked": true,
  "reason": "Suspicious activity" // Optional
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "userId": "60d0...",
    "isBlocked": true
  }
}
```

## Financial Management

### 7. Income History
**Endpoint:** `GET /admin/income-history`
**Query Params:** `page`, `limit`, `userId`, `incomeType`, `startDate`, `endDate`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "incomeHistory": [ ... ],
    "stats": {
      "overall": { "totalAmount": 1000, "count": 50 },
      "byType": [ { "_id": "ROI", "total": 500 } ]
    }
  }
}
```

---

### 8. Deposit History
**Endpoint:** `GET /admin/deposit-history`
**Query Params:** `page`, `limit`, `userId`, `chain`, `status`, `startDate`, `endDate`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deposits": [ ... ],
    "stats": { ... }
  }
}
```

---

### 9. Withdrawal History
**Endpoint:** `GET /admin/withdrawal-history`
**Query Params:** `page`, `limit`, `userId`, `chain`, `status`, `startDate`, `endDate`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "withdrawals": [ ... ],
    "stats": { ... }
  }
}
```

## Fund Management (On-Chain)

### 10. Get All Funds (Deposit Addresses)
**Endpoint:** `GET /admin/funds/all`
**Query Params:** `chain` (Optional)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "BSC": {
      "totalBalance": 1000,
      "details": [
        { "address": "0x...", "balance": 100, "userId": "..." }
      ]
    }
  }
}
```

---

### 11. Sweep Fund From Address
**Endpoint:** `POST /admin/funds/sweep-address`

**Request Body:**
```json
{
  "userAddress": "0xUserDepositAddress...",
  "chain": "BSC"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Funds swept successfully",
  "data": {
    "txHash": "0x...",
    "amount": 100
  }
}
```

---

### 12. Sweep All Funds
**Endpoint:** `POST /admin/funds/sweep-all`

**Request Body:**
```json
{
  "chain": "BSC",
  "minAmount": 10 // Optional minimum amount to sweep
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Sweep process initiated",
  "results": [
    { "address": "0x...", "success": true, "txHash": "0x..." }
  ]
}
```
