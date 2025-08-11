# WeTwo Backend API Documentation

## Base URL
```
https://your-railway-app.railway.app
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "birthDate": "1990-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "profile": {
      "id": "profile-uuid",
      "name": "John Doe",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "zodiacSign": "unknown"
    }
  }
}
```

#### POST /auth/signin
Sign in with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "profile": {
      "id": "profile-uuid",
      "name": "John Doe",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "zodiacSign": "unknown"
    }
  }
}
```

#### POST /auth/apple
Sign in with Apple ID.

**Request Body:**
```json
{
  "idToken": "apple-id-token"
}
```

### Profiles

#### GET /profiles/{id}
Get user profile by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "profile-uuid",
    "name": "John Doe",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "zodiacSign": "unknown",
    "profilePhotoUrl": "https://example.com/photo.jpg",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### PUT /profiles/{id}
Update user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "birthDate": "1990-01-01",
  "photoUrl": "https://example.com/photo.jpg"
}
```

### Memories

#### GET /memories?user_id={id}
Get user memories.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "memory-uuid",
      "userId": "user-uuid",
      "date": "2024-01-01T00:00:00.000Z",
      "title": "Memory Title",
      "description": "Memory description",
      "photoData": "base64-photo-data",
      "location": "Paris, France",
      "moodLevel": "happy",
      "tags": "vacation,paris",
      "isShared": "false",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /memories
Create a new memory.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "date": "2024-01-01",
  "title": "Memory Title",
  "description": "Memory description",
  "photoData": "base64-photo-data",
  "location": "Paris, France",
  "moodLevel": "happy",
  "tags": "vacation,paris",
  "isShared": "false"
}
```

#### PUT /memories/{id}
Update a memory.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Memory Title",
  "description": "Updated description"
}
```

#### DELETE /memories/{id}
Delete a memory.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Mood Entries

#### GET /mood-entries?user_id={id}
Get user mood entries.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mood-uuid",
      "userId": "user-uuid",
      "date": "2024-01-01T00:00:00.000Z",
      "moodLevel": 8,
      "eventLabel": "Had a great day",
      "location": "Home",
      "photoData": "base64-photo-data",
      "insight": "Feeling productive",
      "loveMessage": "Love you!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /mood-entries
Create a new mood entry.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "date": "2024-01-01",
  "moodLevel": 8,
  "eventLabel": "Had a great day",
  "location": "Home",
  "photoUrl": "base64-photo-data",
  "insight": "Feeling productive",
  "loveMessage": "Love you!"
}
```

#### PUT /mood-entries/{id}
Update a mood entry.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "moodLevel": 9,
  "eventLabel": "Even better day"
}
```

### Partnerships

#### GET /partnerships?user_id={id}
Get user partnerships.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "partnership-uuid",
      "userId": "user-uuid",
      "partnerId": "partner-uuid",
      "connectionCode": "partner_123_456",
      "status": "active",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "profile": {
          "name": "John Doe",
          "profilePhotoUrl": "https://example.com/photo.jpg"
        }
      },
      "partner": {
        "id": "partner-uuid",
        "name": "Jane Doe",
        "profile": {
          "name": "Jane Doe",
          "profilePhotoUrl": "https://example.com/photo2.jpg"
        }
      }
    }
  ]
}
```

#### POST /partnerships
Create a new partnership using a connection code.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "connectionCode": "connection-code-from-partner"
}
```

### Love Messages

#### GET /love-messages?user_id={id}
Get user love messages (sent and received).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "message-uuid",
      "senderId": "sender-uuid",
      "receiverId": "receiver-uuid",
      "message": "I love you!",
      "isRead": false,
      "timestamp": "2024-01-01T00:00:00.000Z",
      "sender": {
        "id": "sender-uuid",
        "name": "John Doe",
        "profile": {
          "name": "John Doe",
          "profilePhotoUrl": "https://example.com/photo.jpg"
        }
      },
      "receiver": {
        "id": "receiver-uuid",
        "name": "Jane Doe",
        "profile": {
          "name": "Jane Doe",
          "profilePhotoUrl": "https://example.com/photo2.jpg"
        }
      }
    }
  ]
}
```

#### POST /love-messages
Send a love message to a partner.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "receiverId": "partner-uuid",
  "message": "I love you!"
}
```

### Notifications

#### GET /notifications?user_id={id}
Get user notifications.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "userId": "user-uuid",
      "title": "New Love Message",
      "body": "You received a love message from John",
      "type": "love_message",
      "data": {
        "senderId": "sender-uuid",
        "messageId": "message-uuid"
      },
      "isRead": false,
      "sentAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### PUT /notifications/{id}/read
Mark a notification as read.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notification-uuid",
    "isRead": true
  }
}
```

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `BAD_REQUEST`: Invalid request data
- `UNAUTHORIZED`: Authentication required or invalid credentials
- `FORBIDDEN`: Access denied
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL`: Internal server error

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- All other endpoints: 30 requests per minute

## CORS

The API supports CORS for web applications. Configure your frontend to include credentials in requests.
