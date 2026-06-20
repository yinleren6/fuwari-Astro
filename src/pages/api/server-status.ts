import type { APIRoute } from "astro";

const API_BASE = "http://frp-dad.cn3.top:37878";
const TIMEOUT_MS = 5000;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals.runtime as { env: Record<string, unknown> } | undefined);
  const token = runtime?.env?.TSHOCK_TOKEN as string | undefined;

  if (!token) {
    return Response.json({
      status: "offline",
      playercount: 0,
      maxplayers: 0,
      players: [],
      debug: { hasRuntime: !!runtime, hasToken: !!token, envKeys: runtime?.env ? Object.keys(runtime.env) : [] },
    });
  }

  try {
    const statusUrl = `${API_BASE}/v2/server/status?token=${token}`;
    const playersUrl = `${API_BASE}/lists/players?token=${token}`;

    const [statusRes, playersRes] = await Promise.all([
      fetch(statusUrl, { signal: AbortSignal.timeout(TIMEOUT_MS) }),
      fetch(playersUrl, { signal: AbortSignal.timeout(TIMEOUT_MS) }),
    ]);

    if (!statusRes.ok) {
      return Response.json({
        status: "offline",
        playercount: 0, maxplayers: 0, players: [],
        debug: { error: `Status API returned ${statusRes.status}`, statusUrl },
      });
    }

    const data = await statusRes.json();
    let players: string[] = [];
    if (playersRes.ok) {
      const raw = await playersRes.text();
      try { players = JSON.parse(raw); } catch { players = []; }
    }

    return Response.json({
      status: "online",
      playercount: data.playercount ?? 0,
      maxplayers: data.maxplayers ?? 0,
      players,
    });
  } catch (e) {
    return Response.json({
      status: "offline",
      playercount: 0, maxplayers: 0, players: [],
      debug: { error: e instanceof Error ? e.message : String(e), url: API_BASE },
    });
  }
};
