import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3041),
  HOST: z.string().default('0.0.0.0'),
  APP_URL: z.string().default('http://localhost:3042'),
  API_URL: z.string().default('http://localhost:3041'),
  CORS_ORIGIN: z.string().default('http://localhost:3042'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/attendance_ai_db?schema=public'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379/0'),
  JWT_SECRET: z.string().min(16).default('super_secret_jwt_access_token_key_change_in_production_min_32_chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16).default('super_secret_jwt_refresh_token_key_change_in_production_min_32_chars'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  STORAGE_PATH: z.string().default('./storage/uploads'),
});

export const config = envSchema.parse(process.env);
