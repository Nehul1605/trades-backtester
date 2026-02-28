"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import bcrypt from "bcryptjs";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USERS_COLLECTION_ID,
} from "@/lib/appwrite/config";

export async function registerUser(
  email: string,
  password: string,
  name: string,
): Promise<{ error?: string }> {
  try {
    const { databases } = await createAdminClient();

    // Check if email already exists
    const existing = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email), Query.limit(1)],
    );

    if (existing.documents.length > 0) {
      return { error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      ID.unique(),
      {
        email,
        name,
        password_hash: passwordHash,
        provider: "credentials",
      },
    );

    return {};
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to create account",
    };
  }
}
