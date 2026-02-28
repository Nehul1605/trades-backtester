// Appwrite configuration constants
// Set these in your .env / .env.local file

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";

export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;

export const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

export const APPWRITE_TRADES_COLLECTION_ID =
  process.env.APPWRITE_TRADES_COLLECTION_ID!;

export const APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID =
  process.env.APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID!;

export const APPWRITE_STORAGE_BUCKET_ID =
  process.env.APPWRITE_STORAGE_BUCKET_ID!;

export const APPWRITE_USERS_COLLECTION_ID =
  process.env.APPWRITE_USERS_COLLECTION_ID || "users";
