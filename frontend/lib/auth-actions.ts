"use server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<{ error?: string }> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Failed to create account" };
    }

    return {};
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to create account",
    };
  }
}

