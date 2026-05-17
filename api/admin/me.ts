import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserFromRequest } from "../_lib/auth";
import { supabaseAdmin } from "../_lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // Bootstrap: if no admin exists yet, promote the first authenticated user.
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) === 0) {
    await supabaseAdmin.from("user_roles").insert({ user_id: user.id, role: "admin" });
    return res.status(200).json({ isAdmin: true, bootstrapped: true });
  }

  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  return res.status(200).json({ isAdmin: !!data, bootstrapped: false });
}
