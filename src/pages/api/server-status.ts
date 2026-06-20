import type { APIRoute } from "astro";

const API_BASE = "http://frp-dad.cn3.top:37878";
const TIMEOUT_MS = 5000;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals.runtime as Record<string, unknown> | undefined);
  const env = runtime?.env as Record<string, unknown> | undefined;
  const token = env?.TSHOCK_TOKEN as string | undefined;

  if (!token) {
    return Response.json({
      status: "offline",
      playercount: 0, maxplayers: 0, players: [],
      debug: {
        hasRuntime: !!runtime,
        runtimeKeys: runtime ? Object.keys(runtime) : [],
        envType: typeof env,
        envIsArray: Array.isArray(env),
        hasToken: !!token,
        tokenViaProcess: !!process.env.TSHOCK_TOKEN,
        tokenViaImportMeta: !!(import.meta as Record<string, any>).env?.TSHOCK_TOKEN,
      },
    });
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
