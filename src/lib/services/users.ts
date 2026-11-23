// Creating users and checking passwords. Used by the web forms and the API.
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { ShopError } from "@/lib/errors";

export type PublicUser = {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
};

const publicFields = { id: true, email: true, name: true, role: true } as const;

/** Throws 409 EMAIL_TAKEN if the email is already registered. */
export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ShopError(
      409,
      "EMAIL_TAKEN",
      "An account with this email already exists.",
    );
  }
  return db.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "customer",
    },
    select: publicFields,
  });
}

/** The user if the email and password match, otherwise null. */
export async function authenticate(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
