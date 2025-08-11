// Test setup file
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/wetwo_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.APPLE_AUDIENCE = 'com.jacqueline.wetwo';
process.env.APPLE_ISSUER = 'https://appleid.apple.com';
