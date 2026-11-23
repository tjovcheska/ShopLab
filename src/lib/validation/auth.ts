// Validation rules shared by the browser (instant feedback) and the server
// (the real check). Keep them in one place so both always agree.
import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .pipe(z.email("Enter a valid email address."));

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/\d/, "Password must contain at least one number."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
});

export type RegisterField = keyof z.infer<typeof registerSchema>;
export type RegisterInput = Record<RegisterField, string>;
export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

/**
 * Validates the register form. Returns the cleaned data, or one error message
 * per field. The "passwords match" check runs even when other fields are
 * invalid, so every problem is shown at once.
 */
export function validateRegister(
  input: RegisterInput,
):
  | { success: true; data: z.infer<typeof registerSchema> }
  | { success: false; fieldErrors: FieldErrors<RegisterField> } {
  const result = registerSchema.safeParse(input);
  const fieldErrors: FieldErrors<RegisterField> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as RegisterField;
      fieldErrors[field] ??= issue.message; // keep the first error per field
    }
  }
  if (
    input.confirmPassword &&
    input.password !== input.confirmPassword &&
    !fieldErrors.confirmPassword
  ) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (result.success && Object.keys(fieldErrors).length === 0) {
    return { success: true, data: result.data };
  }
  return { success: false, fieldErrors };
}

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});
