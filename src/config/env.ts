import { z } from 'zod';

/**
 * Environment variables schema with validation
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  
  // CORS Configuration
  CORS_ORIGIN: z.string().default('*'),
  
  // Apple Sign-In Configuration
  // APPLE_AUDIENCE should match your iOS app's Bundle ID (e.g., com.jacqueline.wetwo)
  APPLE_AUDIENCE: z.string().min(1, 'APPLE_AUDIENCE is required'),
  
  // APPLE_ISSUER is always https://appleid.apple.com for Apple Sign-In
  APPLE_ISSUER: z.string().url('APPLE_ISSUER must be a valid URL').refine(
    (val) => val === 'https://appleid.apple.com',
    'APPLE_ISSUER must be https://appleid.apple.com'
  ),
  
  // Railway-specific (optional)
  RAILWAY_RUN_MIGRATIONS: z.string().optional(),
});

/**
 * Parse and validate environment variables
 * Throws descriptive error if any required variables are missing or invalid
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Environment validation failed:');
      console.error('Missing or invalid environment variables:');
      missingVars.forEach(msg => console.error(`  - ${msg}`));
      console.error('\n📝 Please check your .env file or Railway environment variables.');
      console.error('💡 Copy env.example to .env and fill in the required values.');
      console.error('\n🔧 Current environment variables:');
      console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
      console.error('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
      console.error('CORS_ORIGIN:', process.env.CORS_ORIGIN ? 'Set' : 'Missing');
      console.error('APPLE_AUDIENCE:', process.env.APPLE_AUDIENCE ? 'Set' : 'Missing');
      console.error('APPLE_ISSUER:', process.env.APPLE_ISSUER ? 'Set' : 'Missing');
      process.exit(1);
    }
    throw error;
  }
}

const env = validateEnv();

export default env;
