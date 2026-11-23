"use server";
// Server Actions for the register, login, and logout forms.
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/auth";
import { ShopError } from "@/lib/errors";
import { authenticate, createUser } from "@/lib/services/users";
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
  let user;
  try {
    user = await createUser({ name, email, password });
  } catch (error) {
    if (error instanceof ShopError && error.code === "EMAIL_TAKEN") {
      return { fieldErrors: { email: error.message } };
    }
    throw error;
  }

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

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
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
