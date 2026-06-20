import type { APIRoute } from "astro";

const API_BASE = "http://frp-dad.cn3.top:37878";
const TIMEOUT_MS = 5000;

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals.runtime as { env: Record<string, string> } | undefined)
    ?.env;
  const token = env?.TSHOCK_TOKEN;

  if (!token) {
    return Response.json({ status: "offline", playercount: 0, maxplayers: 0, players: [] });
  }

  try {
    const [statusRes, playersRes] = await Promise.all([
      fetch(`${API_BASE}/v2/server/status?token=${token}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
      fetch(`${API_BASE}/lists/players?token=${token}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
    ]);

    if (!statusRes.ok) throw new Error("Status API failed");

    const data = await statusRes.json();
    let players: string[] = [];
    if (playersRes.ok) {
      const raw = await playersRes.text();
      try {
        players = JSON.parse(raw);
      } catch {
        players = [];
      }
    }

    return Response.json({
      status: "online",
      playercount: data.playercount ?? 0,
      maxplayers: data.maxplayers ?? 0,
      players,
    });
  } catch {
    return Response.json({ status: "offline", playercount: 0, maxplayers: 0, players: [] });
  }
};
