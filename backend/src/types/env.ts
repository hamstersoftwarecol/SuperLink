export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  FRONTEND_URL: string;
}
