// GET /account/avatar — the logged-in user's profile picture.
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Not logged in.", { status: 401 });
  const row = await db.user.findUnique({
    where: { id: user.id },
    select: { avatar: true, avatarType: true },
  });
  if (!row?.avatar || !row.avatarType) {
    return new Response("No profile picture.", { status: 404 });
  }
  return new Response(new Uint8Array(row.avatar), {
    headers: { "Content-Type": row.avatarType, "Cache-Control": "no-store" },
  });
}
