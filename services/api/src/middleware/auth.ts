import type { Request, Response, NextFunction } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getPool } from '../db/client.js';

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_ANON_KEY']!
    );
  }
  return _supabase;
}

export interface AuthRequest extends Request {
  userId: string;
  supabaseId: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const pool = getPool();
  const result = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE supabase_id = $1',
    [data.user.id]
  );

  if (result.rows.length > 0) {
    (req as AuthRequest).supabaseId = data.user.id;
    (req as AuthRequest).userId = result.rows[0]!.id;
    next();
    return;
  }

  // First authenticated request for this Supabase user — provision the
  // app-side users row lazily (no Supabase webhook/trigger infra yet).
  // onboarding_completed defaults to false, so the onboarding gate picks
  // up new signups automatically.
  try {
    const insertResult = await pool.query<{ id: string }>(
      `INSERT INTO users (supabase_id, email)
       VALUES ($1, $2)
       ON CONFLICT (supabase_id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [data.user.id, data.user.email ?? '']
    );

    (req as AuthRequest).supabaseId = data.user.id;
    (req as AuthRequest).userId = insertResult.rows[0]!.id;
    next();
  } catch (provisionError) {
    console.error('[auth] Failed to provision user row:', provisionError);
    res.status(500).json({ error: 'Failed to provision user' });
  }
}
