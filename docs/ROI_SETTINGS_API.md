# ROI Settings API (Admin)

Admin-only APIs to get and set the default ROI rate for all users. New deposits use this rate; optionally it can be applied to all existing active investments.

**Base URL:** `{BASE_URL}/api/admin`  
**Auth:** All endpoints require admin login. Send the JWT in the `Authorization` header:

```
Authorization: Bearer <admin_token>
```

---

## 1. Get current ROI rate

Returns the current default ROI percentage (per day) used for new investments.

### Request

| Method | Endpoint        |
|--------|-----------------|
| **GET** | `/settings/roi` |

**Headers:**
- `Authorization: Bearer <admin_jwt_token>`
- `Content-Type: application/json`

**Body:** None

### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "defaultRoiRate": 2
  }
}
```

| Field             | Type   | Description                          |
|-------------------|--------|--------------------------------------|
| `data.defaultRoiRate` | number | Default ROI % per day (e.g. `2` = 2%) |

**Error (401 Unauthorized)** – Missing or invalid token

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (403 Forbidden)** – Not an admin user

```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

## 2. Set ROI rate

Sets the default ROI rate. Optionally updates all active investments to this rate.

### Request

| Method | Endpoint        |
|--------|-----------------|
| **PUT** | `/settings/roi` |

**Headers:**
- `Authorization: Bearer <admin_jwt_token>`
- `Content-Type: application/json`

**Body (JSON):**

| Field                       | Type    | Required | Description                                                                 |
|----------------------------|---------|----------|-----------------------------------------------------------------------------|
| `roiRate`                  | number  | **Yes**  | New default ROI % per day. Allowed range: **0.1** to **100** (e.g. `2.5` = 2.5%). |
| `applyToExistingInvestments` | boolean | No       | If `true`, all **ACTIVE** investments are updated to this rate. Default: `false`. |

**Example – set rate for new investments only:**

```json
{
  "roiRate": 3
}
```

**Example – set rate and apply to all active investments:**

```json
{
  "roiRate": 2.5,
  "applyToExistingInvestments": true
}
```

### Response

**Success (200 OK)**

When **not** applying to existing investments:

```json
{
  "success": true,
  "message": "ROI set to 2.5%.",
  "data": {
    "defaultRoiRate": 2.5,
    "updatedInvestments": 0
  }
}
```

When applying to existing investments:

```json
{
  "success": true,
  "message": "ROI set to 2.5%. Updated 150 active investments.",
  "data": {
    "defaultRoiRate": 2.5,
    "updatedInvestments": 150
  }
}
```

| Field                    | Type   | Description                                  |
|--------------------------|--------|----------------------------------------------|
| `data.defaultRoiRate`   | number | The ROI rate that was set                    |
| `data.updatedInvestments` | number | Count of active investments updated (when `applyToExistingInvestments: true`) |

**Error (400 Bad Request)** – Missing or invalid `roiRate`

```json
{
  "success": false,
  "message": "roiRate required (0.1–100)"
}
```

or

```json
{
  "success": false,
  "message": "ROI rate must be between 0.1 and 100"
}
```

**Error (401/403)** – Same as Get ROI endpoint.

**Error (500 Internal Server Error)**

```json
{
  "success": false,
  "message": "<error details>"
}
```

---

## Quick reference

| Action           | Method | Endpoint       | Body                                                                 |
|------------------|--------|----------------|----------------------------------------------------------------------|
| Get ROI rate     | GET    | `/settings/roi` | —                                                                   |
| Set ROI rate     | PUT    | `/settings/roi` | `{ "roiRate": number, "applyToExistingInvestments": boolean? }`     |

**Notes for frontend:**
- ROI is **% per day** (e.g. `2` = 2% daily on investment amount).
- After a successful PUT, new deposits use the new rate immediately.
- Use `applyToExistingInvestments: true` only when the admin explicitly wants to change the rate for all current active investments in one go.
