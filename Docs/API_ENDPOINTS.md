# SocialFlow API - Complete Endpoint Mapping

## Global Configuration

**Base URL:** `http://localhost:3000`
**Default Pagination:** skip=0, take=10

### CORS Configuration
The API enables CORS for local development:
```
Allowed Origins: 
  - http://localhost:3000
  - http://localhost:3001
  - http://localhost:5173
```

**Important for Cookies:** Frontend must:
1. Set `credentials: 'include'` in fetch/axios
2. Have origin in allowed list
3. CORS will automatically include/accept cookies

### CORS with Fetch (Browser)
```javascript
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // IMPORTANT: Send cookies
  body: JSON.stringify({ email: 'user@example.com', password: 'pass' })
});
```

### CORS with Axios (Browser)
```javascript
axios.defaults.withCredentials = true;  // IMPORTANT: Send cookies
axios.post('http://localhost:3000/auth/login', { email, password });
```

---

## 1. AUTH MODULE

### 1.1 Login
- **POST** `/auth/login`
- **Auth:** None
- **Roles:** N/A
- **Response Cookies:** `authorization` (HTTP-only, Secure, 24h)

**Request:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "string (ADMIN|DESIGNER|CLIENT)",
    "isActive": "boolean"
  },
  "organizations": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "name": "string",
      "slug": "string",
      "role": "string",
      "isActive": "boolean"
    }
  ]
}
```

**Response Headers:**
```
Set-Cookie: authorization=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Errors:**
- 400: Missing email or password
- 401: Invalid credentials

---

**Note:** Token is sent via HTTP-only cookie, not in response body

---

### 1.2 Validate Token
- **GET** `/auth/me`
- **Auth:** JWT (from HTTP-only cookie)
- **Roles:** All (ADMIN, DESIGNER, CLIENT)

**Request:** None (uses HTTP-only cookie automatically)

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "string",
    "organizationId": "uuid",
    "isActive": "boolean"
  }
}
```

**Errors:**
- 401: No token in cookie
- 401: Invalid token

---

**Note:** Token is automatically sent from HTTP-only cookie by the browser

---

### 1.3 Select Organization
- **POST** `/auth/select-organization`
- **Auth:** JWT (from HTTP-only cookie)
- **Roles:** All (ADMIN, DESIGNER, CLIENT)

**Request:**
```json
{
  "organizationId": "uuid (must be valid UUID)"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "string",
    "organizationId": "uuid",
    "isActive": "boolean"
  }
}
```

**Response Headers:**
```
Set-Cookie: authorization=<NEW_JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Errors:**
- 400: organizationId is required
- 400: organizationId must be valid UUID
- 401: Unauthorized (no token in cookie)
- 403: User doesn't have access to organization

---

**Note:** New token is sent via HTTP-only cookie, not in response body

---

## 2. ORGANIZATIONS MODULE

### 2.1 Create Organization
- **POST** `/organizations`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Request:**
```json
{
  "name": "string (3-255 chars)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string (auto-generated from name)",
  "isActive": "boolean",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: name is required
- 400: name must be 3-255 characters
- 401: Unauthorized
- 403: Forbidden (not ADMIN)
- 409: Organization with slug already exists

---

### 2.2 Get All Organizations
- **GET** `/organizations`
- **Auth:** JWT Required
- **Roles:** All

**Query Params:**
- skip?: number (default 0)
- take?: number (default 10)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "isActive": "boolean",
    "createdAt": "ISO8601 date",
    "updatedAt": "ISO8601 date"
  }
]
```

**Errors:**
- 401: Unauthorized

---

### 2.3 Get Organization by ID
- **GET** `/organizations/:id`
- **Auth:** JWT Required
- **Roles:** All (ADMIN sees all, others see only their org)

**Path Params:**
- id: uuid

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "isActive": "boolean",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID format
- 401: Unauthorized
- 403: Forbidden
- 404: Organization not found

---

### 2.4 Update Organization
- **PATCH** `/organizations/:id`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Request:**
```json
{
  "name": "string (3-255 chars)"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "isActive": "boolean",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden
- 404: Organization not found
- 409: Slug already exists

---

### 2.5 Reactivate Organization
- **PATCH** `/organizations/:id/reactivate`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Response 200 or 201:**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "isActive": "boolean",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden
- 404: Organization not found

---

### 2.6 Delete Organization
- **DELETE** `/organizations/:id`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Response 204:** No content

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden
- 404: Organization not found

---

## 3. CAMPAIGNS MODULE

### 3.1 Create Campaign
- **POST** `/campaigns`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Request:**
```json
{
  "title": "string (3-255 chars, required)",
  "referenceYear": "number? (2000-2099)",
  "referenceMonth": "number? (1-12)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "title": "string",
  "referenceYear": "number | null",
  "referenceMonth": "number | null",
  "isActive": "boolean",
  "createdByUserId": "uuid",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: title required, must be 3-255 chars
- 400: referenceYear must be 2000-2099
- 400: referenceMonth must be 1-12
- 401: Unauthorized
- 403: Forbidden

---

### 3.2 Get All Campaigns
- **GET** `/campaigns`
- **Auth:** JWT Required
- **Roles:** All

**Query Params:**
- skip?: number (default 0)
- take?: number (default 10)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "title": "string",
    "referenceYear": "number | null",
    "referenceMonth": "number | null",
    "isActive": "boolean",
    "createdByUserId": "uuid",
    "createdAt": "ISO8601 date",
    "updatedAt": "ISO8601 date"
  }
]
```

**Errors:**
- 401: Unauthorized

---

### 3.3 Get Campaign by ID
- **GET** `/campaigns/:id`
- **Auth:** JWT Required
- **Roles:** All

**Path Params:**
- id: uuid

**Response 200:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "title": "string",
  "referenceYear": "number | null",
  "referenceMonth": "number | null",
  "isActive": "boolean",
  "createdByUserId": "uuid",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 404: Campaign not found

---

### 3.4 Update Campaign
- **PATCH** `/campaigns/:id`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Request:**
```json
{
  "title": "string? (3-255 chars)",
  "referenceYear": "number? (2000-2099)",
  "referenceMonth": "number? (1-12)"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "title": "string",
  "referenceYear": "number | null",
  "referenceMonth": "number | null",
  "isActive": "boolean",
  "createdByUserId": "uuid",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID or validation errors
- 401: Unauthorized
- 403: Forbidden
- 404: Campaign not found

---

### 3.5 Delete Campaign (Soft Delete)
- **DELETE** `/campaigns/:id`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Response 200 or 204:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "title": "string",
  "referenceYear": "number | null",
  "referenceMonth": "number | null",
  "isActive": "boolean",
  "createdByUserId": "uuid",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden
- 404: Campaign not found

---

## 4. POSTS MODULE

### 4.1 Create Post
- **POST** `/posts`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Request:**
```json
{
  "campaignId": "uuid (required)",
  "scheduledFor": "ISO8601 date (required)",
  "briefing": "string? (max 500 chars)",
  "captionFixed": "string (1-2000 chars, required)",
  "assignedDesignerId": "uuid?"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "campaignId": "uuid",
  "scheduledFor": "ISO8601 date",
  "briefing": "string | null",
  "captionFixed": "string",
  "status": "string (DRAFT, SCHEDULED, PUBLISHED, CANCELLED)",
  "assignedDesignerId": "uuid | null",
  "createdByUserId": "uuid",
  "currentVersionId": "uuid | null",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Missing required fields
- 400: captionFixed must be 1-2000 chars
- 401: Unauthorized
- 403: Forbidden

---

### 4.2 Get All Posts
- **GET** `/posts`
- **Auth:** JWT Required
- **Roles:** All

**Query Params:**
- skip?: number (default 0)
- take?: number (default 10)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "campaignId": "uuid",
    "scheduledFor": "ISO8601 date",
    "briefing": "string | null",
    "captionFixed": "string",
    "status": "string",
    "assignedDesignerId": "uuid | null",
    "createdByUserId": "uuid",
    "currentVersionId": "uuid | null",
    "createdAt": "ISO8601 date",
    "updatedAt": "ISO8601 date"
  }
]
```

**Errors:**
- 401: Unauthorized

---

### 4.3 Get Post by ID
- **GET** `/posts/:id`
- **Auth:** JWT Required
- **Roles:** All

**Path Params:**
- id: uuid

**Response 200:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "campaignId": "uuid",
  "scheduledFor": "ISO8601 date",
  "briefing": "string | null",
  "captionFixed": "string",
  "status": "string",
  "assignedDesignerId": "uuid | null",
  "createdByUserId": "uuid",
  "currentVersionId": "uuid | null",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 404: Post not found

---

### 4.4 Update Post
- **PATCH** `/posts/:id`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Request:**
```json
{
  "scheduledFor": "ISO8601 date?",
  "briefing": "string? (max 500)",
  "captionFixed": "string? (1-2000)",
  "assignedDesignerId": "uuid? | null"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "campaignId": "uuid",
  "scheduledFor": "ISO8601 date",
  "briefing": "string | null",
  "captionFixed": "string",
  "status": "string",
  "assignedDesignerId": "uuid | null",
  "createdByUserId": "uuid",
  "currentVersionId": "uuid | null",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Validation errors
- 401: Unauthorized
- 403: Forbidden
- 404: Post not found

---

### 4.5 Cancel Post
- **DELETE** `/posts/:id`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Response 200 or 204:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "campaignId": "uuid",
  "scheduledFor": "ISO8601 date",
  "briefing": "string | null",
  "captionFixed": "string",
  "status": "CANCELLED",
  "assignedDesignerId": "uuid | null",
  "createdByUserId": "uuid",
  "currentVersionId": "uuid | null",
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden
- 404: Post not found

---

## 5. POST-VERSIONS MODULE

### 5.1 Upload Post Version
- **POST** `/post-versions/upload`
- **Auth:** JWT Required
- **Roles:** ADMIN, DESIGNER

**Request:**
```json
{
  "postId": "uuid (required)",
  "feedUrl": "string? (URL)",
  "storiesUrl": "string? (URL)"
}
```
**Note:** At least one URL required

**Response 201:**
```json
{
  "id": "uuid",
  "postId": "uuid",
  "organizationId": "uuid",
  "versionNumber": "number (auto-increment)",
  "feedUrl": "string | null",
  "storiesUrl": "string | null",
  "uploadedByUserId": "uuid",
  "uploadedByUser": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "name": "string | null"
  },
  "createdAt": "ISO8601 date"
}
```

**Errors:**
- 400: postId required or invalid UUID
- 400: At least one URL required
- 401: Unauthorized
- 403: Forbidden (CLIENT can't upload)
- 404: Post not found

---

### 5.2 Get All Post Versions
- **GET** `/post-versions`
- **Auth:** JWT Required
- **Roles:** All

**Query Params:**
- postId: uuid (required)
- skip?: number (default 0)
- take?: number (default 10)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "postId": "uuid",
      "organizationId": "uuid",
      "versionNumber": "number",
      "feedUrl": "string | null",
      "storiesUrl": "string | null",
      "uploadedByUserId": "uuid",
      "uploadedByUser": {
        "id": "uuid",
        "email": "string",
        "role": "string",
        "name": "string | null"
      },
      "createdAt": "ISO8601 date"
    }
  ],
  "count": "number",
  "skip": "number",
  "take": "number"
}
```

**Errors:**
- 400: postId required
- 401: Unauthorized

---

### 5.3 Get Post Version by ID
- **GET** `/post-versions/:versionId`
- **Auth:** JWT Required
- **Roles:** All

**Path Params:**
- versionId: uuid

**Response 200:**
```json
{
  "id": "uuid",
  "postId": "uuid",
  "organizationId": "uuid",
  "versionNumber": "number",
  "feedUrl": "string | null",
  "storiesUrl": "string | null",
  "uploadedByUserId": "uuid",
  "uploadedByUser": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "name": "string | null"
  },
  "createdAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 404: Version not found

---

### 5.4 Update Post Version
- **PATCH** `/post-versions/:versionId`
- **Auth:** JWT Required
- **Roles:** ADMIN, DESIGNER

**Path Params:**
- versionId: uuid

**Request:**
```json
{
  "feedUrl": "string?",
  "storiesUrl": "string?"
}
```
**Note:** At least one must be provided

**Response 200:**
```json
{
  "id": "uuid",
  "postId": "uuid",
  "organizationId": "uuid",
  "versionNumber": "number",
  "feedUrl": "string | null",
  "storiesUrl": "string | null",
  "uploadedByUserId": "uuid",
  "uploadedByUser": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "name": "string | null"
  },
  "createdAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID or validation errors
- 401: Unauthorized
- 403: Forbidden (CLIENT can't update)
- 404: Version not found

---

### 5.5 Delete Post Version
- **DELETE** `/post-versions/:versionId`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- versionId: uuid

**Response 204:** No content

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden (only ADMIN can delete)
- 404: Version not found

---

## 6. POST-COMMENTS MODULE

### 6.1 Create Post Comment
- **POST** `/post-comments`
- **Auth:** JWT Required
- **Roles:** All (ADMIN, DESIGNER, CLIENT)

**Request:**
```json
{
  "postId": "uuid (required)",
  "postVersionId": "uuid (required)",
  "body": "string (1-2000 chars, required)",
  "target": "string? (FEED, STORIES, GENERAL - defaults to GENERAL)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "postId": "uuid",
  "postVersionId": "uuid",
  "organizationId": "uuid",
  "authorUserId": "uuid",
  "authorUser": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "name": "string | null"
  },
  "target": "string (FEED, STORIES, GENERAL)",
  "body": "string",
  "createdAt": "ISO8601 date"
}
```

**Errors:**
- 400: postId or postVersionId invalid/missing
- 400: body required and 1-2000 chars
- 401: Unauthorized
- 404: Post or version not found

---

### 6.2 Get All Post Comments
- **GET** `/post-comments`
- **Auth:** JWT Required
- **Roles:** All

**Query Params:**
- postId: uuid (required)
- skip?: number (default 0)
- take?: number (default 10)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "postId": "uuid",
      "postVersionId": "uuid",
      "organizationId": "uuid",
      "authorUserId": "uuid",
      "authorUser": {
        "id": "uuid",
        "email": "string",
        "role": "string",
        "name": "string | null"
      },
      "target": "string",
      "body": "string",
      "createdAt": "ISO8601 date"
    }
  ],
  "count": "number",
  "skip": "number",
  "take": "number"
}
```

**Errors:**
- 400: postId required
- 401: Unauthorized

---

### 6.3 Get Comment by ID
- **GET** `/post-comments/:commentId`
- **Auth:** JWT Required
- **Roles:** All

**Path Params:**
- commentId: uuid

**Response 200:**
```json
{
  "id": "uuid",
  "postId": "uuid",
  "postVersionId": "uuid",
  "organizationId": "uuid",
  "authorUserId": "uuid",
  "authorUser": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "name": "string | null"
  },
  "target": "string",
  "body": "string",
  "createdAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 404: Comment not found

---

### 6.4 Update Comment
- **PATCH** `/post-comments/:commentId`
- **Auth:** JWT Required
- **Roles:** All (own comments or ADMIN)

**Path Params:**
- commentId: uuid

**Request:**
```json
{
  "body": "string? (1-2000 chars)",
  "target": "string? (FEED, STORIES, GENERAL)"
}
```
**Note:** At least one field must be provided

**Response 200:**
```json
{
  "id": "uuid",
  "postId": "uuid",
  "postVersionId": "uuid",
  "organizationId": "uuid",
  "authorUserId": "uuid",
  "authorUser": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "name": "string | null"
  },
  "target": "string",
  "body": "string",
  "createdAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID or validation errors
- 401: Unauthorized
- 403: Forbidden (not owner and not ADMIN)
- 404: Comment not found

---

### 6.5 Delete Comment
- **DELETE** `/post-comments/:commentId`
- **Auth:** JWT Required
- **Roles:** All (own comments or ADMIN)

**Path Params:**
- commentId: uuid

**Response 204:** No content

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden (not owner and not ADMIN)
- 404: Comment not found

---

## 7. ASSETS MODULE

### 7.1 Upload Asset
- **POST** `/assets/upload`
- **Auth:** JWT Required
- **Roles:** ADMIN, DESIGNER
- **Content-Type:** multipart/form-data

**Request Form Data:**
```
postId: uuid (required)
assetType: string (1-100 chars, required)
file: binary (required, max 10MB)
```

**Response 201:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "postId": "uuid",
  "postVersionId": "uuid | null",
  "fileName": "string (Cloudinary public_id)",
  "originalFileName": "string",
  "fileSize": "number (bytes)",
  "mimeType": "string",
  "cloudinaryPublicId": "string",
  "cloudinaryUrl": "string (HTTPS URL)",
  "assetType": "string",
  "uploadedByUserId": "uuid",
  "uploadedByUser": {
    "id": "uuid",
    "email": "string",
    "name": "string | null"
  },
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: postId or assetType missing
- 400: File size > 10MB
- 401: Unauthorized
- 403: Forbidden (CLIENT can't upload)
- 404: Post not found

---

### 7.2 Delete Asset
- **DELETE** `/assets/:id`
- **Auth:** JWT Required
- **Roles:** ADMIN only

**Path Params:**
- id: uuid

**Response 200 or 204:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "postId": "uuid",
  "postVersionId": "uuid | null",
  "fileName": "string",
  "originalFileName": "string",
  "fileSize": "number",
  "mimeType": "string",
  "cloudinaryPublicId": "string",
  "cloudinaryUrl": "string",
  "assetType": "string",
  "uploadedByUserId": "uuid",
  "uploadedByUser": {
    "id": "uuid",
    "email": "string",
    "name": "string | null"
  },
  "createdAt": "ISO8601 date",
  "updatedAt": "ISO8601 date"
}
```

**Errors:**
- 400: Invalid UUID
- 401: Unauthorized
- 403: Forbidden (only ADMIN)
- 404: Asset not found

---

## RBAC Summary Matrix

| Endpoint | ADMIN | DESIGNER | CLIENT |
|----------|-------|----------|--------|
| POST /organizations | ✅ | ❌ | ❌ |
| GET /organizations | ✅ | ✅ | ✅ |
| PATCH /organizations | ✅ | ❌ | ❌ |
| DELETE /organizations | ✅ | ❌ | ❌ |
| POST /campaigns | ✅ | ❌ | ❌ |
| GET /campaigns | ✅ | ✅ | ✅ |
| PATCH /campaigns | ✅ | ❌ | ❌ |
| DELETE /campaigns | ✅ | ❌ | ❌ |
| POST /posts | ✅ | ❌ | ❌ |
| GET /posts | ✅ | ✅ | ✅ |
| PATCH /posts | ✅ | ❌ | ❌ |
| DELETE /posts | ✅ | ❌ | ❌ |
| POST /post-versions/upload | ✅ | ✅ | ❌ |
| GET /post-versions | ✅ | ✅ | ✅ |
| PATCH /post-versions | ✅ | ✅ | ❌ |
| DELETE /post-versions | ✅ | ❌ | ❌ |
| POST /post-comments | ✅ | ✅ | ✅ |
| GET /post-comments | ✅ | ✅ | ✅ |
| PATCH /post-comments | ✅* | ✅* | ✅* |
| DELETE /post-comments | ✅* | ✅* | ❌ |
| POST /assets/upload | ✅ | ✅ | ❌ |
| DELETE /assets | ✅ | ❌ | ❌ |

*Own only, except ADMIN (ADMIN has full access)

---

## Authentication

### HTTP-only Cookie Strategy

Tokens are stored in **HTTP-only cookies** for enhanced security:
- **Cookie Name:** `authorization`
- **Flags:** `HttpOnly`, `Secure` (production only), `SameSite=Strict`
- **Expiration:** 24 hours
- **Auto-sent:** Browser automatically includes cookie with every request

### For Web Applications (Browser)
1. Login to `/auth/login` → Token automatically stored in HTTP-only cookie
2. Subsequent requests → Browser automatically sends cookie with each request
3. No manual header manipulation needed

### For API Clients (Postman, Mobile, etc.)

**Option 1: Use Authorization Header**
```
Authorization: Bearer {JWT_TOKEN}
```

**Option 2: Include Cookie in Request**
```
Cookie: authorization={JWT_TOKEN}
```

The API accepts both methods for compatibility.

### JWT Token Structure
```json
{
  "sub": "userId (uuid)",
  "email": "user@example.com",
  "role": "ADMIN|DESIGNER|CLIENT",
  "organizationId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890 + 24*3600 (24 hours)
}
```

### Cookie Security Features
- **HttpOnly:** Prevents XSS attacks (JavaScript cannot access cookie)
- **Secure:** Only sent over HTTPS in production
- **SameSite=Strict:** Prevents CSRF attacks
- **24h Expiration:** Auto-cleanup via MaxAge

---

## Common Status Codes

- **200 OK:** Success
- **201 Created:** Resource created
- **204 No Content:** Success with no response body
- **400 Bad Request:** Validation error or missing fields
- **401 Unauthorized:** Missing or invalid JWT
- **403 Forbidden:** User doesn't have permission
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists (e.g., duplicate slug)

---

## Notes

- All timestamps are ISO 8601 format with timezone
- UUIDs are version 4
- Soft deletes: isActive flag used instead of hard delete
- Pagination default: skip=0, take=10
- File uploads: Cloudinary integration, returns HTTPS URLs
- All responses exclude sensitive fields: passwordHash, internal flags
