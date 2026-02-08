# Frontend Integration Guide - Complete User Flow

## 📋 **Table of Contents**

1. [Authentication Flow](#authentication-flow)
2. [Deposit Flow](#deposit-flow)
3. [Trading Flow](#trading-flow)
4. [Dashboard & User Data](#dashboard--user-data)
5. [Password Management](#password-management)
6. [WebSocket Integration](#websocket-integration)
7. [Error Handling](#error-handling)
8. [API Reference](#api-reference)

---

## 🔐 **Authentication Flow**

### **1. User Registration**

**Endpoint:** `POST /api/trade/register`

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "referrerId": "UID123456" // Optional: Referrer's UID
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email with OTP.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "UID": "UID789012",
    "isEmailVerified": false
  }
}
```

**Frontend Flow:**
1. User fills registration form
2. Call register API
3. Show OTP verification screen
4. Store email for OTP verification

---

### **2. Verify OTP**

**Endpoint:** `POST /api/trade/verifyOTP`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

**Frontend Flow:**
1. User enters OTP received via email
2. Call verifyOTP API
3. If successful → Redirect to login
4. If failed → Show error, allow resend OTP

---

### **3. Resend OTP**

**Endpoint:** `POST /api/trade/resendOTP`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

---

### **4. User Login**

**Endpoint:** `POST /api/trade/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "deviceType": "web", // Optional
  "deviceToken": "" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "UID": "UID789012",
    "fullName": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "expire": "2024-12-31T23:59:59.000Z",
    "refreshToken": "refresh_token_here",
    "Balance": 0,
    "winningBalance": 0,
    "lockBalance": 0,
    "isEmailVerified": true
  }
}
```

**Frontend Flow:**
1. User enters email and password
2. Call login API
3. Store token in localStorage/sessionStorage
4. Store user data
5. Redirect to dashboard
6. Set up WebSocket connection (see WebSocket section)

**Important:** 
- Store `token` for authenticated requests
- Include in header: `Authorization: Bearer {token}`
- Check `isEmailVerified` - if false, redirect to OTP verification

---

## 💰 **Deposit Flow**

### **1. Get Deposit Address**

**Endpoint:** `GET /api/trade/getDepositAddress?chain=BSC`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `chain` (required): `BSC`, `ETH`, or `POLYGON`

**Response:**
```json
{
  "success": true,
  "message": "Deposit address retrieved successfully",
  "data": {
    "chain": "BSC",
    "address": "0x1234567890123456789012345678901234567890",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x..."
  }
}
```

**Frontend Flow:**
1. User selects chain (BSC/ETH/POLYGON)
2. Call getDepositAddress API
3. Display address and QR code
4. User copies address or scans QR code
5. User sends USDT from their wallet
6. **Deposit is automatically detected** (no need to call API)
7. Show pending status → Update when deposit confirmed

**Important:**
- Same address is returned for same user + chain
- Deposit is automatically processed (no manual confirmation needed)
- Monitor deposit via WebSocket or polling deposit history

---

### **2. Get All Deposit Addresses**

**Endpoint:** `GET /api/trade/getAllDepositAddresses`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit addresses retrieved successfully",
  "data": {
    "BSC": "0x1234567890123456789012345678901234567890",
    "ETH": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "POLYGON": "0x9876543210987654321098765432109876543210"
  }
}
```

---

### **3. Get Deposit History**

**Endpoint:** `GET /api/trade/getDepositHistory`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "DEPOSIT",
      "amount": 100.5,
      "chain": "BSC",
      "txHash": "0xabc123...",
      "status": "CONFIRMED",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Frontend Flow:**
1. Display list of deposits
2. Show amount, chain, transaction hash (link to explorer)
3. Show status (CONFIRMED/PENDING)
4. Auto-refresh or use WebSocket for updates

---

## 📈 **Trading Flow**

### **1. Get Prices**

**Endpoint:** `GET /api/trade/getPrices`

**Response:**
```json
{
  "success": true,
  "data": {
    "BTC-USD": 45000.50,
    "ETH-USD": 2500.75,
    "SOL-USD": 100.25,
    "LTC-USD": 75.50,
    "XRP-USD": 0.55,
    "BCH-USD": 300.00
  }
}
```

**Frontend Flow:**
1. Call getPrices on page load
2. Subscribe to WebSocket for real-time price updates (see WebSocket section)
3. Update prices in real-time
4. Use prices for trade entry/exit

---

### **2. Place Trade**

**Endpoint:** `POST /api/trade/placeSelfTrade`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "pair": "BTC-USD",
  "amount": 10,
  "direction": "UP", // or "DOWN"
  "duration": "1m" // Options: "30s", "1m", "3m", "5m", "10m", "15m", "30m", "1h", "24h"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trade placed",
  "data": {
    "tradeId": "507f1f77bcf86cd799439011",
    "entryPrice": 45000.50,
    "expiryTime": "2024-01-15T10:31:00.000Z"
  }
}
```

**Frontend Flow:**
1. User selects trading pair
2. User enters amount (check balance first)
3. User selects direction (UP/DOWN)
4. User selects duration
5. Call placeSelfTrade API
6. Show trade confirmation
7. Add to live trades list
8. Subscribe to WebSocket for trade updates

**Validation:**
- Check user balance >= amount
- Minimum amount: Check with backend
- Available pairs: BTC-USD, ETH-USD, SOL-USD, LTC-USD, XRP-USD, BCH-USD

---

### **3. Get Live Trades**

**Endpoint:** `GET /api/trade/getLiveTrades`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "pair": "BTC-USD",
      "direction": "UP",
      "grossAmount": 10,
      "feeAmount": 0.3,
      "netTradeAmount": 9.7,
      "entryPrice": 45000.50,
      "exitPrice": null,
      "startTime": "2024-01-15T10:30:00.000Z",
      "expiryTime": "2024-01-15T10:31:00.000Z",
      "status": "OPEN"
    }
  ]
}
```

**Frontend Flow:**
1. Load live trades on page load
2. Display countdown to expiry
3. Subscribe to WebSocket for real-time updates
4. Update when trade resolves (WIN/LOSS)

---

### **4. Get Trade History**

**Endpoint:** `GET /api/trade/getTradeHistory?status=WIN&pair=BTC-USD&page=1&limit=20`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `OPEN`, `WIN`, `LOSS`
- `pair` (optional): Trading pair
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "pair": "BTC-USD",
      "direction": "UP",
      "grossAmount": 10,
      "entryPrice": 45000.50,
      "exitPrice": 45100.25,
      "status": "WIN",
      "startTime": "2024-01-15T10:30:00.000Z",
      "expiryTime": "2024-01-15T10:31:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

---

## 📊 **Dashboard & User Data**

### **1. Get Dashboard**

**Endpoint:** `GET /api/trade/getDashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balances": {
      "balance": 1000.50,
      "winningBalance": 250.75,
      "lockedBalance": 50.00
    },
    "incomes": {
      "referralIncome": 150.00,
      "levelIncome": 75.50,
      "salaryIncome": 200.00
    },
    "stats": {
      "totalDeposited": 2000.00,
      "totalTradedVolume": 5000.00,
      "isActive": true,
      "withdrawUnlocked": true
    }
  }
}
```

**Frontend Flow:**
1. Load dashboard on page load
2. Display balances, incomes, stats
3. Refresh periodically or use WebSocket
4. Show active status badge
5. Show withdrawal unlock status

**Key Fields:**
- `balance`: Available balance for trading
- `winningBalance`: Winnings from trades
- `lockedBalance`: Funds locked in open trades
- `isActive`: User has traded >= $2
- `withdrawUnlocked`: Can withdraw winnings

---

## 🔑 **Password Management**

### **1. Change Password**

**Endpoint:** `POST /api/trade/changePassword`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### **2. Forgot Password - Send OTP**

**Endpoint:** `POST /api/trade/forgotPassword`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

---

### **3. Verify Forgot Password OTP**

**Endpoint:** `POST /api/trade/verifyForgotPasswordOTP`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": {
    "email": "john@example.com"
  }
}
```

---

### **4. Reset Password**

**Endpoint:** `POST /api/trade/resetPassword`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

**Frontend Flow:**
1. User clicks "Forgot Password"
2. Enter email → Send OTP
3. Enter OTP → Verify
4. Enter new password → Reset
5. Redirect to login

---

## 🔌 **WebSocket Integration**

### **Connection Setup**

**URL:** `ws://your-backend-url` or `wss://your-backend-url`

**Connection:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  cors: {
    origin: "*"
  }
});

// After successful login, join user room
socket.emit('join_user', userEmail || userUID);
```

### **Events to Emit (Send to Server)**

#### **1. Join Public Prices**
```javascript
socket.emit('join_public');
// Join room to receive all price updates
```

#### **2. Join Specific Pair**
```javascript
socket.emit('join_pair', 'BTC-USD');
// Join room for specific trading pair updates
```

#### **3. Leave Pair**
```javascript
socket.emit('leave_pair', 'BTC-USD');
// Leave room when user switches pairs
```

#### **4. Join User Room**
```javascript
socket.emit('join_user', userEmail || userUID);
// Join user-specific room for trade results, deposits, etc.
// Should be called after login
```

### **Events to Listen (Receive from Server)**

#### **1. All Prices Update (Public Room)**
```javascript
socket.on('pair_prices', (data) => {
  // data: [
  //   { pair: "BTC-USD", price: 45000.50 },
  //   { pair: "ETH-USD", price: 2500.75 },
  //   ...
  // ]
  // Update all prices in UI
  data.forEach(({ pair, price }) => {
    updatePrice(pair, price);
  });
});
```

#### **2. Specific Pair Price Update**
```javascript
socket.on('pair_price', (data) => {
  // data: {
  //   pair: "BTC-USD",
  //   price: 45000.50,
  //   timestamp: 1705315200000
  // }
  // Update specific pair price in UI
  updatePrice(data.pair, data.price);
});
```

#### **2. Trade Started (Recovery)**
```javascript
socket.on('bet_started', (data) => {
  // Emitted when user reconnects and has active trades
  // data: {
  //   betId: "507f1f77bcf86cd799439011",
  //   pair: "BTC-USD",
  //   direction: "UP",
  //   entryPrice: 45000.50,
  //   expiryTime: "2024-01-15T10:31:00.000Z",
  //   recovered: true
  // }
  // Add to live trades list
});
```

#### **3. Trade Result**
```javascript
socket.on('bet_result', (data) => {
  // Emitted when trade resolves (WIN/LOSS)
  // data: {
  //   betId: "507f1f77bcf86cd799439011",
  //   pair: "BTC-USD",
  //   direction: "UP",
  //   entryPrice: 45000.50,
  //   exitPrice: 45100.25,
  //   status: "WIN", // or "LOSS"
  //   winningBalance: 250.75
  // }
  // Update trade status, show result notification, update balance
  showTradeResult(data);
  updateBalance(data.winningBalance);
});
```

#### **4. Trade Started (New Trade)**
```javascript
socket.on('bet_started', (data) => {
  // Emitted when new trade is placed OR when reconnecting with active trades
  // data: {
  //   betId: "507f1f77bcf86cd799439011",
  //   pair: "BTC-USD",
  //   direction: "UP",
  //   entryPrice: 45000.50,
  //   expiryTime: "2024-01-15T10:31:00.000Z",
  //   recovered: false // true if recovered on reconnect
  // }
  // Add to live trades list
  addToLiveTrades(data);
});
```

**Note:** Deposit confirmations are currently handled automatically by the backend. You can poll `/getDepositHistory` or refresh dashboard to see updated balance. WebSocket events for deposits may be added in future updates.

### **Connection Management**

```javascript
// Connect
socket.connect();

// Disconnect
socket.disconnect();

// Check connection
if (socket.connected) {
  // Connected
}

// Reconnect on disconnect
socket.on('disconnect', () => {
  console.log('Disconnected, reconnecting...');
  socket.connect();
});
```

---

## ⚠️ **Error Handling**

### **Common Error Responses**

#### **401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```
**Action:** Redirect to login, refresh token

#### **400 Bad Request**
```json
{
  "success": false,
  "message": "Validation error message"
}
```
**Action:** Show error message to user

#### **403 Forbidden**
```json
{
  "success": false,
  "message": "User not allowed"
}
```
**Action:** Show error, check user status

#### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```
**Action:** Log error, show generic error message

### **Error Handling Pattern**

```javascript
try {
  const response = await fetch('/api/trade/placeSelfTrade', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tradeData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  if (data.success) {
    // Handle success
  } else {
    // Handle failure
    showError(data.message);
  }
} catch (error) {
  console.error('Error:', error);
  showError(error.message);
}
```

---

## 📡 **API Reference**

### **Base URL**
```
Development: http://localhost:3000
Production: https://your-production-domain.com
```

### **All Endpoints**

#### **Authentication**
- `POST /api/trade/register` - Register new user
- `POST /api/trade/verifyOTP` - Verify email OTP
- `POST /api/trade/resendOTP` - Resend OTP
- `POST /api/trade/login` - User login

#### **Deposit**
- `GET /api/trade/getDepositAddress?chain=BSC` - Get deposit address
- `GET /api/trade/getAllDepositAddresses` - Get all addresses
- `GET /api/trade/getDepositHistory` - Get deposit history

#### **Trading**
- `GET /api/trade/getPrices` - Get current prices
- `POST /api/trade/placeSelfTrade` - Place new trade
- `GET /api/trade/getLiveTrades` - Get open trades
- `GET /api/trade/getTradeHistory` - Get trade history

#### **Dashboard**
- `GET /api/trade/getDashboard` - Get user dashboard

#### **Password Management**
- `POST /api/trade/changePassword` - Change password (auth required)
- `POST /api/trade/forgotPassword` - Send forgot password OTP
- `POST /api/trade/verifyForgotPasswordOTP` - Verify OTP
- `POST /api/trade/resetPassword` - Reset password

---

## 🔄 **Complete User Journey**

### **New User Flow**

1. **Registration**
   - User fills form → Call `/register`
   - Show OTP screen → Call `/verifyOTP`
   - Redirect to login

2. **Login**
   - User logs in → Call `/login`
   - Store token → Connect WebSocket
   - Redirect to dashboard

3. **Deposit**
   - User clicks deposit → Select chain
   - Call `/getDepositAddress` → Show address/QR
   - User sends USDT → Wait for confirmation
   - Listen to WebSocket for deposit confirmation

4. **Trading**
   - User views prices → Subscribe to price updates
   - User places trade → Call `/placeSelfTrade`
   - Show live trades → Listen for trade results
   - Update balance on win/loss

5. **Dashboard**
   - Load dashboard → Call `/getDashboard`
   - Show balances, incomes, stats
   - Refresh periodically

---

## 📝 **Implementation Checklist**

### **Authentication**
- [ ] Registration form
- [ ] OTP verification screen
- [ ] Login form
- [ ] Token storage (localStorage/sessionStorage)
- [ ] Token refresh logic
- [ ] Logout functionality

### **Deposit**
- [ ] Chain selection UI
- [ ] Deposit address display
- [ ] QR code generation/display
- [ ] Deposit history list
- [ ] Deposit status indicators
- [ ] WebSocket deposit notifications

### **Trading**
- [ ] Price display (real-time)
- [ ] Trading form (pair, amount, direction, duration)
- [ ] Balance validation
- [ ] Live trades list
- [ ] Trade history with pagination
- [ ] Trade result notifications
- [ ] Countdown timers

### **Dashboard**
- [ ] Balance cards
- [ ] Income display
- [ ] Statistics
- [ ] Active status badge
- [ ] Withdrawal unlock status

### **WebSocket**
- [ ] Connection setup
- [ ] Price update subscription
- [ ] Trade result handling
- [ ] Deposit confirmation handling
- [ ] Reconnection logic

### **Error Handling**
- [ ] Network error handling
- [ ] API error handling
- [ ] Token expiration handling
- [ ] User-friendly error messages

---

## 🎨 **UI/UX Recommendations**

### **Deposit Flow**
- Show clear instructions: "Send USDT to this address"
- Display QR code prominently
- Show minimum deposit amount
- Display transaction status (Pending → Confirmed)
- Link to blockchain explorer for transaction hash

### **Trading Flow**
- Show real-time prices with up/down indicators
- Display countdown timer for open trades
- Show win/loss animations
- Display entry/exit prices clearly
- Show profit/loss calculations

### **Dashboard**
- Use cards for different sections
- Show balance prominently
- Display income breakdown
- Show trading statistics
- Use badges for status indicators

---

## 🔒 **Security Best Practices**

1. **Token Storage**
   - Use `httpOnly` cookies if possible
   - Or use `sessionStorage` (cleared on tab close)
   - Never store in `localStorage` for sensitive apps

2. **API Calls**
   - Always include `Authorization` header
   - Handle token expiration gracefully
   - Implement token refresh if available

3. **Input Validation**
   - Validate on frontend (UX)
   - Always validate on backend (security)
   - Sanitize user inputs

4. **Error Messages**
   - Don't expose sensitive information
   - Show user-friendly messages
   - Log detailed errors server-side only

---

## 📞 **Support & Testing**

### **Test Credentials**
Use test accounts for development (if available)

### **Test Scenarios**
1. Register → Verify OTP → Login
2. Get deposit address → Send test USDT
3. Place test trade → Wait for result
4. Check dashboard updates
5. Test password reset flow

### **Common Issues**
- **Token expired:** Implement refresh or redirect to login
- **WebSocket disconnected:** Implement auto-reconnect
- **Price not updating:** Check WebSocket connection
- **Deposit not showing:** Check transaction on blockchain explorer

---

## ✅ **Ready to Integrate!**

This guide covers all user flows. Start with:
1. Authentication (Register → Login)
2. Dashboard (Get user data)
3. Deposit (Get address → Monitor)
4. Trading (Get prices → Place trades)
5. WebSocket (Real-time updates)

Good luck with your integration! 🚀
