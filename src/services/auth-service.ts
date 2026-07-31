import { createUser as createUserRecord, findUserByEmail } from "@/repositories/auth-repository";
import argon2 from "argon2";

export async function createUser(input: { email: string; password: string }) {
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await createUserRecord({
    email: input.email,
    passwordHash: hashedPassword,
  });

  return { id: user.id, email: user.email };
}

function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}