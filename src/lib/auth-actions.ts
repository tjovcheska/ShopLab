"use server";
// Server Actions for the register, login, and logout forms.
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { safeRedirectPath } from "@/lib/auth";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import {
  loginSchema,
  validateRegister,
  type FieldErrors,
  type RegisterField,
} from "@/lib/validation/auth";

export type RegisterState = { fieldErrors: FieldErrors<RegisterField> };

export async function registerAction(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const result = validateRegister({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!result.success) return { fieldErrors: result.fieldErrors };

  const { name, email, password } = result.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      fieldErrors: { email: "An account with this email already exists." },
    };
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "customer",
    },
  });

  await setSessionCookie(user.id);
  redirect(safeRedirectPath(formData.get("next")));
}

export type LoginState = { error: string | null };

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  const passwordOk =
    user !== null && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !passwordOk) {
    // Same message for unknown email and wrong password, on purpose.
    return { error: "Invalid email or password." };
  }

  await setSessionCookie(user.id);
  redirect(safeRedirectPath(formData.get("next")));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
