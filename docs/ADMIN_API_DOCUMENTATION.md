# Admin API Documentation

Base URL: `/api/trade/admin`

## Authentication

### 1. Admin Login
**Endpoint:** `POST /signIn`
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}
```
**Response:**
```json
{
  "Data": {
    "_id": "...",
    "token": "...",
    "type": "Bearer",
    "expire": 3600,
    "role": "ADMIN"
  },
  "message": "Success"
}
```

### 2. Admin Signup (Initial Setup)
**Endpoint:** `POST /signup`
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}
```

## Admin Dashboard

### 1. Get Dashboard Stats
**Endpoint:** `GET /dashboard`
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "totalUsers": 100,
      "activeUsers": 80,
      "blockedUsers": 5,
      "verifiedUsers": 90
    },
    "balances": {
      "totalDeposited": 50000,
      "totalTradedVolume": 200000,
      "totalBalance": 10000
    },
    "trades": {
      "totalTrades": 500,
      "openTrades": 10,
      "totalGrossAmount": 5000
    },
    "withdrawals": {
      "withdrawWinnings": { "totalAmount": 1000, "count": 10 },
      "withdrawWorking": { "totalAmount": 500, "count": 5 }
    },
    "incomes": {
      "referralBonus": { "totalAmount": 200, "count": 20 },
      "totalIncomeAmount": 500
    }
  }
}
```

## User Management

### 1. List Users
**Endpoint:** `GET /users`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page`: Default 1.
- `limit`: Default 20.
- `search`: Search by email, name, or UID.
- `isBlocked`: `true` or `false`.
- `isDeleted`: `true` or `false`.
- `sortBy`: Default `createdAt`.
- `sortOrder`: `asc` or `desc`.
**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 2. Get User Details
**Endpoint:** `GET /users/details`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `id`: User ID (mongo ID) OR
- `uid`: User UID (e.g. UID12345)
**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "balances": { ... },
    "incomes": { ... },
    "stats": { ... }
  }
}
```

### 3. Update User Status (Block/Delete)
**Endpoint:** `PATCH /users/:id/status`
**Headers:** `Authorization: Bearer <token>`
**URL Params:** `id` (User Mongo ID)
**Request Body:**
```json
{
  "isBlocked": true, // Optional
  "isDeleted": false // Optional
}
```

## Fund Management (Treasury)

### 1. Get Deposit Address Balance
**Endpoint:** `GET /funds/address/balance`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `address`: The wallet address.
- `chain`: `BSC`, `ETH`, or `POLYGON`.
**Response:**
```json
{
  "success": true,
  "data": "100.500000" // Balance in USDT
}
```

### 2. Get All Deposit Balances for Chain
**Endpoint:** `GET /funds/chain/balances`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `chain`: `BSC`, `ETH`, or `POLYGON`.
**Response:**
```json
{
  "success": true,
  "data": {
    "0xuserWallet1...": "50.000000",
    "0xuserWallet2...": "10.000000"
  }
}
```

### 3. Sweep Funds from Single Address
**Endpoint:** `POST /funds/sweep/address`
**Headers:** `Authorization: Bearer <token>`
**Description:** Transfer funds from a specific user deposit address to a central wallet.
**Request Body:**
```json
{
  "address": "0xuserWallet...",
  "chain": "BSC",
  "toAddress": "0xadminTreasury..."
}
```

### 4. Sweep All Funds (Batch)
**Endpoint:** `POST /funds/sweep/all`
**Headers:** `Authorization: Bearer <token>`
**Description:** Trigger sweep for all deposit addresses on a chain.
**Request Body:**
```json
{
  "chain": "BSC",
  "toAddress": "0xadminTreasury..."
}
```

### 5. Check if Address Can Be Swept
**Endpoint:** `GET /funds/check/sweep`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `address`: The wallet address.
- `chain`: `BSC`, `ETH`, or `POLYGON`.
**Response:**
```json
{
  "success": true,
  "data": {
    "canSweep": true,
    "usdtBalance": "100.0",
    "nativeBalance": "0.01",
    "gasRequired": "0.005",
    "message": "Ready to sweep"
  }
}
```

## History & Logs

### 1. List Trades History (All Users)
**Endpoint:** `GET /trades`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page`, `limit`
- `status`: `WIN`, `LOSS`, `OPEN`
- `pair`: e.g. `BTC-USD`
- `userId` / `uid` / `email`: Filter by user.
- `startDate`, `endDate`

### 2. List Income History
**Endpoint:** `GET /income/history`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page`, `limit`
- `type`: `REFERRAL_BONUS`, `LEVEL_INCOME`, etc.
- `userId` / `uid` / `email`

### 3. List Deposit History
**Endpoint:** `GET /deposits/history`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page`, `limit`
- `status`
- `userId` / `uid` / `email`

### 4. List Withdrawal History
**Endpoint:** `GET /withdrawals/history`
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page`, `limit`
- `status`
- `type`: `WITHDRAW_WINNINGS` or `WITHDRAW_WORKING`
- `userId` / `uid` / `email`
