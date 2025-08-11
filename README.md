# WeTwo Backend

A production-ready backend API for the WeTwo mood tracking application built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- 🔐 **JWT Authentication** with Apple Sign-In support
- 📊 **Mood Tracking** with daily entries and history
- 👤 **User Profiles** with zodiac sign calculation
- 🛡️ **Security** with rate limiting, CORS, and input validation
- 🧪 **Testing** with Vitest and integration tests
- 🐳 **Docker** support for easy deployment
- 📝 **Comprehensive Logging** with Pino

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (HS256) + Apple Sign-In
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Logging**: Pino
- **Rate Limiting**: express-rate-limit

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wetwo_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   # For local development, you can use SQLite:
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secure-jwt-secret-key-minimum-32-characters"
   CORS_ORIGIN="http://localhost:5173"
   APPLE_AUDIENCE="com.jacqueline.wetwo"
   APPLE_ISSUER="https://appleid.apple.com"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations (creates database and tables)
   npm run db:migrate
   
   # (Optional) Seed with test data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Railway Deployment

1. **Connect your repository to Railway**
   - Go to [Railway.app](https://railway.app)
   - Create a new project
   - Connect your GitHub repository

2. **Set up PostgreSQL Database**
   - Add a PostgreSQL service to your project
   - Railway will automatically provide the `DATABASE_URL` environment variable
   - The database will be created automatically

3. **Set up environment variables in Railway**
   - Go to your project settings
   - Add these environment variables:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://...  # Railway provides this automatically
   JWT_SECRET=your-secure-production-jwt-secret-minimum-32-characters
   CORS_ORIGIN=https://your-frontend-domain.com
   APPLE_AUDIENCE=com.jacqueline.wetwo
   APPLE_ISSUER=https://appleid.apple.com
   ```

4. **Database Setup**
   - Railway will automatically run the database migrations
   - The complete schema will be created with all tables, indexes, and functions
   - Sample data will be inserted automatically

5. **Deploy**
   - Railway will automatically detect the Dockerfile and build your application
   - The application will be deployed and available at the provided Railway URL
   - Health checks will run automatically on `/health` endpoint

### Database Schema

The application uses a comprehensive PostgreSQL schema with the following features:

- **Users & Profiles**: Complete user management with Apple Sign-In support
- **Partnerships**: Couple connections with unique codes
- **Memories**: Shared memories and events between partners
- **Mood Tracking**: Daily mood entries with insights
- **Love Messages**: Private messaging between partners
- **Notifications**: Push notification system
- **File Storage**: Metadata for uploaded files
- **Sessions**: User authentication sessions

The schema includes:
- ✅ UUID primary keys for security
- ✅ Proper foreign key relationships
- ✅ Database indexes for performance
- ✅ Triggers for automatic timestamps
- ✅ PostgreSQL functions for business logic
- ✅ Views for common queries
- ✅ Sample data for testing

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
JWT_SECRET=your-secure-jwt-secret-key
CORS_ORIGIN=http://localhost:5173
APPLE_AUDIENCE=com.jacqueline.wetwo
APPLE_ISSUER=https://appleid.apple.com
```

## API Endpoints

### Authentication

#### `POST /auth/apple`
Apple Sign-In authentication.

**Request Body:**
```json
{
  "idToken": "apple_id_token"
}
```

**Response:**
```json
{
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "user_id"
    },
    "profile": {
      "id": "profile_id",
      "name": "",
      "zodiacSign": "unknown",
      "birthDate": null,
      "photoUrl": null
    }
  }
}
```

### Profile Management

#### `GET /me/profile`
Get current user's profile (requires authentication).

#### `PUT /me/profile`
Update user's profile (requires authentication).

**Request Body:**
```json
{
  "name": "User Name",
  "birthDate": "1990-08-01",
  "photoUrl": "https://example.com/photo.jpg"
}
```

### Mood Tracking

#### `POST /moods`
Create a new mood entry (requires authentication).

**Request Body:**
```json
{
  "moodLevel": 4,
  "eventLabel": "Great day at the beach",
  "date": "2023-12-25"
}
```

#### `PUT /moods/:id`
Update an existing mood entry (requires authentication).

**Request Body:**
```json
{
  "moodLevel": 5,
  "eventLabel": "Updated event label"
}
```

#### `GET /moods/today`
Get today's mood entry (requires authentication).

#### `GET /moods?from=2023-12-01&to=2023-12-31`
Get mood entries within a date range (requires authentication).

### Health Check

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "data": {
    "status": "ok"
  }
}
```

## Database Schema

### User
- `id` (UUID, Primary Key)
- `email` (String, Optional, Unique)
- `appleSub` (String, Optional, Unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Profile
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key, Unique)
- `name` (String)
- `birthDate` (DateTime, Optional)
- `zodiacSign` (String, Default: "unknown")
- `photoUrl` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### MoodEntry
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `date` (DateTime)
- `moodLevel` (Integer, 0-5)
- `eventLabel` (String, Optional)
- `photoUrl` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- Unique constraint on `[userId, date]`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data
- `npm run studio` - Open Prisma Studio

## Testing

Run the test suite:

```bash
npm test
```

The test suite includes:
- Unit tests for date utilities and zodiac calculation
- Integration tests for authentication flows
- Integration tests for mood tracking functionality

## Docker Deployment

### Build the image
```bash
docker build -t wetwo-backend .
```

### Run the container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  -e JWT_SECRET=your_jwt_secret \
  -e CORS_ORIGIN=your_cors_origin \
  wetwo-backend
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/wetwo
      - JWT_SECRET=your_jwt_secret
      - CORS_ORIGIN=http://localhost:5173
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=wetwo
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Railway Deployment

1. Connect your repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

Required environment variables for Railway:
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `APPLE_AUDIENCE`
- `APPLE_ISSUER`

## Security Features

- **Rate Limiting**: 5 requests/minute for auth, 30 requests/minute for write operations
- **CORS**: Configurable origin restriction
- **Input Validation**: Zod schemas for all endpoints
- **JWT Authentication**: Secure token-based authentication
- **Apple Sign-In**: Verified with Apple's JWKS
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL",
    "message": "Human-readable error message",
    "details": { /* Optional additional details */ }
  }
}
```

## iOS Integration Examples

### Apple Sign-In
```swift
// iOS gets identityToken from Apple
let request = URLRequest(url: URL(string: "https://your-api.com/auth/apple")!)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONSerialization.data(withJSONObject: ["idToken": identityToken])

// Store JWT token in Keychain for subsequent requests
```

### Profile Update
```swift
let request = URLRequest(url: URL(string: "https://your-api.com/me/profile")!)
request.httpMethod = "PUT"
request.setValue("Bearer \(jwtToken)", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONSerialization.data(withJSONObject: [
    "name": "Benny",
    "birthDate": "1990-08-01"
])
```

### Mood Entry
```swift
let request = URLRequest(url: URL(string: "https://your-api.com/moods")!)
request.httpMethod = "POST"
request.setValue("Bearer \(jwtToken)", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONSerialization.data(withJSONObject: [
    "moodLevel": 4,
    "eventLabel": "Beach day"
])
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

ISC License
