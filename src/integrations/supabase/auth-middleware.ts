// SPA refactor: server-side auth middleware no longer used.
// Auth is now validated in /api/* Vercel functions via api/_lib/auth.ts
export const requireSupabaseAuth = undefined;
export default requireSupabaseAuth;
