import { z } from 'zod';

/**
 * Esquema de variables de entorno requeridas por la API.
 * Se valida una sola vez al arrancar `index.ts` — si falla, el proceso
 * termina con `process.exit(1)` y un mensaje legible de qué falta.
 */
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),

  // Auth
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),

  // IA
  DEEPSEEK_API_KEY: z.string().min(1),

  // Redis (BullMQ)
  REDIS_URL: z.string().min(1),

  // Cloudflare R2
  CLOUDFLARE_R2_BUCKET: z.string().min(1),
  CLOUDFLARE_R2_ENDPOINT: z.string().min(1),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().optional(),

  // Twilio WhatsApp
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_WHATSAPP_FROM: z.string().min(1),

  // RevenueCat
  REVENUECAT_API_KEY: z.string().optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),

  // Optional config
  AUTH_CALLBACK_URL: z.string().optional(),
  MOBILE_DEEP_LINK: z.string().optional(),
  API_URL: z.string().optional(),
  LOG_LEVEL: z.string().optional(),

  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function loadEnv(): z.infer<typeof EnvSchema> {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[env] Variables de entorno inválidas o faltantes:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
