# Railway Configuration for WeTwo Backend

## Environment URLs

### Staging Environment
- **URL**: `https://wetwo-backend-staging.up.railway.app`
- **Purpose**: Development and testing
- **Database**: Staging PostgreSQL instance
- **CORS Origin**: `https://wetwo-app-staging.vercel.app`

### Production Environment
- **URL**: `https://wetwo-backend-production.up.railway.app`
- **Purpose**: Live production environment
- **Database**: Production PostgreSQL instance
- **CORS Origin**: `https://wetwo-app.vercel.app`

## iOS App Configuration

### RailwayConfig.swift
Create this file in your iOS app to manage the backend URLs:

```swift
import Foundation

enum Environment {
    case staging
    case production
}

struct RailwayConfig {
    static let currentEnvironment: Environment = .staging // Change to .production for release
    
    static var baseURL: String {
        switch currentEnvironment {
        case .staging:
            return "https://wetwo-backend-staging.up.railway.app"
        case .production:
            return "https://wetwo-backend-production.up.railway.app"
        }
    }
    
    static var apiURL: String {
        return baseURL
    }
    
    // API Endpoints
    struct Endpoints {
        static let health = "/health"
        static let authApple = "/auth/apple"
        static let profile = "/me/profile"
        static let moods = "/moods"
        static let memories = "/memories"
        static let partnerships = "/partnerships"
        static let loveMessages = "/love-messages"
    }
}

// Usage example:
// let url = URL(string: RailwayConfig.apiURL + RailwayConfig.Endpoints.authApple)!
```

## Environment Variables for Railway

### Staging Environment Variables
```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://...  # Railway provides automatically
JWT_SECRET=your-staging-jwt-secret
CORS_ORIGIN=https://wetwo-app-staging.vercel.app
APPLE_AUDIENCE=com.jacqueline.wetwo
APPLE_ISSUER=https://appleid.apple.com
```

### Production Environment Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...  # Railway provides automatically
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://wetwo-app.vercel.app
APPLE_AUDIENCE=com.jacqueline.wetwo
APPLE_ISSUER=https://appleid.apple.com
```

## Deployment Instructions

### 1. Create Staging Environment
1. Go to [Railway.app](https://railway.app)
2. Create a new project: `wetwo-backend-staging`
3. Connect your GitHub repository
4. Add PostgreSQL service
5. Set environment variables for staging
6. Deploy

### 2. Create Production Environment
1. Create another project: `wetwo-backend-production`
2. Connect the same GitHub repository
3. Add PostgreSQL service
4. Set environment variables for production
5. Deploy

### 3. Update iOS App
1. Copy the `RailwayConfig.swift` code above
2. Set `currentEnvironment` to `.staging` for development
3. Set `currentEnvironment` to `.production` for App Store release
4. Test both environments

## Health Check Endpoints

Both environments provide health checks at:
- Staging: `https://wetwo-backend-staging.up.railway.app/health`
- Production: `https://wetwo-backend-production.up.railway.app/health`

## Monitoring

- Railway provides automatic health checks
- Monitor logs in Railway dashboard
- Set up alerts for downtime
- Track API usage and performance

## Security Notes

- Each environment has its own database
- JWT secrets are different for each environment
- CORS is configured per environment
- Apple Sign-In works with both environments
- Use staging for development and testing
- Use production only for App Store releases
