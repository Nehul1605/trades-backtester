import { Client, Account, Databases, Storage, Users } from "node-appwrite";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
} from "./config";

/**
 * Create an admin Appwrite client using the API key.
 * Used for all database/storage operations (auth is handled by Clerk).
 */
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
