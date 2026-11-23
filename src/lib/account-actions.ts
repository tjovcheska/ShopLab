"use server";
// Profile picture upload on /account.
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { filesFrom } from "@/lib/upload";

const MAX_AVATAR_BYTES = 1024 * 1024; // 1 MB
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export type AvatarState = { ok: boolean; message: string | null };

export async function uploadAvatarAction(
  _previous: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in again." };

  const [file, ...extra] = filesFrom(formData, "avatar");
  if (!file) return { ok: false, message: "Choose a picture first." };
  if (extra.length > 0)
    return { ok: false, message: "Choose only one picture." };
  if (!AVATAR_TYPES.includes(file.type)) {
    return { ok: false, message: "Use a PNG, JPEG, GIF, or WebP image." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: "The picture must be 1 MB or smaller." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      avatar: new Uint8Array(await file.arrayBuffer()),
      avatarType: file.type,
    },
  });
  revalidatePath("/account");
  return { ok: true, message: `Profile picture updated (${file.name}).` };
}

export async function removeAvatarAction(): Promise<AvatarState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in again." };
  await db.user.update({
    where: { id: user.id },
    data: { avatar: null, avatarType: null },
  });
  revalidatePath("/account");
  return { ok: true, message: "Profile picture removed." };
}
