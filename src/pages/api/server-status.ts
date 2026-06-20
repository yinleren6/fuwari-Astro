import type { APIRoute } from "astro";

const API_BASE = "http://frp-dad.cn3.top:37878";
const TIMEOUT_MS = 5000;

export const GET: APIRoute = async () => {
  let token: string | undefined;

  try {
    // cloudflare:workers is a Workers-specific module
    const cfEnv = await import("cloudflare:workers");
    token = cfEnv.env.TSHOCK_TOKEN as string | undefined;
  } catch {
    // fallback for local dev
    token = (import.meta as Record<string, any>).env?.TSHOCK_TOKEN;
  }

  if (!token) {
    return Response.json({ status: "offline", playercount: 0, maxplayers: 0, players: [] });
  }

  try {
    const [statusRes, playersRes] = await Promise.all([
      fetch(`${API_BASE}/v2/server/status?token=${token}`, { signal: AbortSignal.timeout(TIMEOUT_MS) }),
      fetch(`${API_BASE}/lists/players?token=${token}`, { signal: AbortSignal.timeout(TIMEOUT_MS) }),
    ]);

    if (!statusRes.ok) throw new Error(`Status API returned ${statusRes.status}`);

    const data = await statusRes.json();
    let players: string[] = [];
    if (playersRes.ok) {
      try { players = await playersRes.json(); } catch { players = []; }
    }

    return Response.json({
      status: "online",
      playercount: data.playercount ?? 0,
      maxplayers: data.maxplayers ?? 0,
      players,
    });
  } catch (e) {
    return Response.json({
      status: "offline", playercount: 0, maxplayers: 0, players: [],
      debug: { error: e instanceof Error ? e.message : String(e) },
    });
  }
};
