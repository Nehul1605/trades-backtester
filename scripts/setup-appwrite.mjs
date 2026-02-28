#!/usr/bin/env node

/**
 * Appwrite Setup Script
 * ---------------------
 * Creates the trades collection, broker_accounts collection (with all attributes
 * and indexes), and the trade-screenshots storage bucket.
 *
 * Prerequisites:
 *   1. Create an Appwrite project at https://cloud.appwrite.io
 *   2. Create an API key with full scopes (databases.*, collections.*, attributes.*, storage.*)
 *   3. Create a Database in the console and note its ID
 *
 * Then fill in .env.local with at least:
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
 *   NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your project id>
 *   APPWRITE_API_KEY=<your api key>
 *   APPWRITE_DATABASE_ID=<your database id>
 *
 * Run:
 *   node scripts/setup-appwrite.mjs
 */

import {
  Client,
  Databases,
  Storage,
  ID,
  Permission,
  Role,
  IndexType,
} from "node-appwrite";
import { readFileSync } from "fs";
import { resolve } from "path";

// Simple .env parser (no dotenv dependency needed)
function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
}

loadEnv(resolve(process.cwd(), ".env.local"));
loadEnv(resolve(process.cwd(), ".env"));

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

if (!PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error(
    "❌  Missing env vars. Make sure NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY, and APPWRITE_DATABASE_ID are set in .env.local",
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createStringAttr(dbId, colId, key, size, required = false) {
  try {
    await databases.createStringAttribute(dbId, colId, key, size, required);
    console.log(`   ✓ string  ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`   → skip ${key} (exists)`);
    else throw e;
  }
}

async function createFloatAttr(dbId, colId, key, required = false) {
  try {
    await databases.createFloatAttribute(dbId, colId, key, required);
    console.log(`   ✓ float   ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`   → skip ${key} (exists)`);
    else throw e;
  }
}

async function createDatetimeAttr(dbId, colId, key, required = false) {
  try {
    await databases.createDatetimeAttribute(dbId, colId, key, required);
    console.log(`   ✓ datetime ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`   → skip ${key} (exists)`);
    else throw e;
  }
}

async function waitForAttributes(dbId, colId) {
  // Appwrite processes attributes asynchronously; wait until none are "processing"
  let attempts = 0;
  while (attempts < 30) {
    const attrs = await databases.listAttributes(dbId, colId);
    const processing = attrs.attributes.filter(
      (a) => a.status === "processing",
    );
    if (processing.length === 0) return;
    await sleep(1000);
    attempts++;
  }
  console.warn("   ⚠ some attributes still processing after 30s");
}

async function createIndex(dbId, colId, key, type, attributes, orders) {
  try {
    await databases.createIndex(dbId, colId, key, type, attributes, orders);
    console.log(`   ✓ index   ${key}`);
  } catch (e) {
    if (e.code === 409) console.log(`   → skip index ${key} (exists)`);
    else throw e;
  }
}

// ── Trades Collection ────────────────────────────────────────────────────────

async function setupTradesCollection() {
  const TRADES_ID = process.env.APPWRITE_TRADES_COLLECTION_ID || "trades";

  console.log("\n📦 Creating trades collection...");

  try {
    await databases.createCollection(DATABASE_ID, TRADES_ID, "trades", [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ]);
    console.log("   ✓ collection created");
  } catch (e) {
    if (e.code === 409) console.log("   → collection already exists");
    else throw e;
  }

  // Enable document-level permissions so RLS-like behavior works
  try {
    await databases.updateCollection(
      DATABASE_ID,
      TRADES_ID,
      "trades",
      undefined,
      true,
    );
  } catch {}

  // Attributes
  await createStringAttr(DATABASE_ID, TRADES_ID, "user_id", 64, true);
  await createStringAttr(DATABASE_ID, TRADES_ID, "symbol", 32, true);
  await createFloatAttr(DATABASE_ID, TRADES_ID, "entry_price", true);
  await createFloatAttr(DATABASE_ID, TRADES_ID, "exit_price", false);
  await createStringAttr(DATABASE_ID, TRADES_ID, "entry_price_text", 64, false);
  await createStringAttr(DATABASE_ID, TRADES_ID, "exit_price_text", 64, false);
  await createFloatAttr(DATABASE_ID, TRADES_ID, "quantity", true);
  await createStringAttr(DATABASE_ID, TRADES_ID, "trade_type", 16, true); // long/short
  await createStringAttr(DATABASE_ID, TRADES_ID, "entry_date", 32, true);
  await createStringAttr(DATABASE_ID, TRADES_ID, "exit_date", 32, false);
  await createStringAttr(DATABASE_ID, TRADES_ID, "status", 16, true); // open/closed
  await createStringAttr(DATABASE_ID, TRADES_ID, "strategy_name", 256, false);
  await createStringAttr(DATABASE_ID, TRADES_ID, "notes", 4096, false);
  await createStringAttr(DATABASE_ID, TRADES_ID, "screenshot_url", 1024, false);
  await createFloatAttr(DATABASE_ID, TRADES_ID, "pnl", false);
  await createFloatAttr(DATABASE_ID, TRADES_ID, "pnl_percentage", false);
  await createFloatAttr(DATABASE_ID, TRADES_ID, "stop_loss", false);
  await createFloatAttr(DATABASE_ID, TRADES_ID, "take_profit", false);
  await createStringAttr(
    DATABASE_ID,
    TRADES_ID,
    "broker_account_id",
    64,
    false,
  );
  await createStringAttr(DATABASE_ID, TRADES_ID, "external_id", 128, false);

  console.log("   ⏳ waiting for attributes to be ready...");
  await waitForAttributes(DATABASE_ID, TRADES_ID);

  // Indexes
  await createIndex(
    DATABASE_ID,
    TRADES_ID,
    "idx_user_id",
    IndexType.Key,
    ["user_id"],
    ["ASC"],
  );
  await createIndex(
    DATABASE_ID,
    TRADES_ID,
    "idx_entry_date",
    IndexType.Key,
    ["entry_date"],
    ["DESC"],
  );
  await createIndex(
    DATABASE_ID,
    TRADES_ID,
    "idx_status",
    IndexType.Key,
    ["status"],
    ["ASC"],
  );

  console.log("   ✅ trades collection ready");
  return TRADES_ID;
}

// ── Users Collection (Auth.js) ───────────────────────────────────────────────

async function setupUsersCollection() {
  const USERS_ID = process.env.APPWRITE_USERS_COLLECTION_ID || "users";

  console.log("\n📦 Creating users collection...");

  try {
    await databases.createCollection(DATABASE_ID, USERS_ID, "users", [
      Permission.read(Role.any()),
    ]);
    console.log("   ✓ collection created");
  } catch (e) {
    if (e.code === 409) console.log("   → collection already exists");
    else throw e;
  }

  await createStringAttr(DATABASE_ID, USERS_ID, "email", 320, true);
  await createStringAttr(DATABASE_ID, USERS_ID, "name", 256, true);
  await createStringAttr(DATABASE_ID, USERS_ID, "password_hash", 512, false);
  await createStringAttr(DATABASE_ID, USERS_ID, "provider", 32, true); // credentials / google

  console.log("   ⏳ waiting for attributes to be ready...");
  await waitForAttributes(DATABASE_ID, USERS_ID);

  await createIndex(
    DATABASE_ID,
    USERS_ID,
    "idx_users_email",
    IndexType.Unique,
    ["email"],
    ["ASC"],
  );

  console.log("   ✅ users collection ready");
  return USERS_ID;
}

// ── Broker Accounts Collection ───────────────────────────────────────────────

async function setupBrokerAccountsCollection() {
  const BROKER_ID =
    process.env.APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID || "broker_accounts";

  console.log("\n📦 Creating broker_accounts collection...");

  try {
    await databases.createCollection(
      DATABASE_ID,
      BROKER_ID,
      "broker_accounts",
      [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
    );
    console.log("   ✓ collection created");
  } catch (e) {
    if (e.code === 409) console.log("   → collection already exists");
    else throw e;
  }

  try {
    await databases.updateCollection(
      DATABASE_ID,
      BROKER_ID,
      "broker_accounts",
      undefined,
      true,
    );
  } catch {}

  await createStringAttr(DATABASE_ID, BROKER_ID, "user_id", 64, true);
  await createStringAttr(DATABASE_ID, BROKER_ID, "broker_type", 32, true); // exness / mt5
  await createStringAttr(DATABASE_ID, BROKER_ID, "account_id", 128, true);
  await createStringAttr(DATABASE_ID, BROKER_ID, "server", 256, true);
  await createStringAttr(DATABASE_ID, BROKER_ID, "password", 512, true);
  await createStringAttr(DATABASE_ID, BROKER_ID, "status", 32, false); // pending/connected/failed
  await createFloatAttr(DATABASE_ID, BROKER_ID, "balance", false);
  await createFloatAttr(DATABASE_ID, BROKER_ID, "equity", false);
  await createStringAttr(DATABASE_ID, BROKER_ID, "currency", 8, false);
  await createDatetimeAttr(DATABASE_ID, BROKER_ID, "last_sync", false);

  console.log("   ⏳ waiting for attributes to be ready...");
  await waitForAttributes(DATABASE_ID, BROKER_ID);

  await createIndex(
    DATABASE_ID,
    BROKER_ID,
    "idx_ba_user_id",
    IndexType.Key,
    ["user_id"],
    ["ASC"],
  );

  console.log("   ✅ broker_accounts collection ready");
  return BROKER_ID;
}

// ── Storage Bucket ───────────────────────────────────────────────────────────

async function setupStorageBucket() {
  const BUCKET_ID =
    process.env.APPWRITE_STORAGE_BUCKET_ID || "trade-screenshots";

  console.log("\n🗄️  Creating trade-screenshots storage bucket...");

  try {
    await storage.createBucket(
      BUCKET_ID,
      "trade-screenshots",
      [
        Permission.create(Role.users()),
        Permission.read(Role.any()), // public read for screenshot URLs
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // fileSecurity
      true, // enabled
      50000000, // 50 MB max file size (in bytes)
      ["image/png", "image/jpeg", "image/gif", "image/webp"], // allowed types
    );
    console.log("   ✓ bucket created");
  } catch (e) {
    if (e.code === 409) console.log("   → bucket already exists");
    else throw e;
  }

  console.log("   ✅ storage bucket ready");
  return BUCKET_ID;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Appwrite Setup for TradeTracker Pro");
  console.log(`   Endpoint:  ${ENDPOINT}`);
  console.log(`   Project:   ${PROJECT_ID}`);
  console.log(`   Database:  ${DATABASE_ID}`);

  const tradesId = await setupTradesCollection();
  const usersId = await setupUsersCollection();
  const brokerId = await setupBrokerAccountsCollection();
  const bucketId = await setupStorageBucket();

  console.log("\n────────────────────────────────────────");
  console.log("✅ All done! Add these to your .env.local:\n");
  console.log(`APPWRITE_TRADES_COLLECTION_ID=${tradesId}`);
  console.log(`APPWRITE_USERS_COLLECTION_ID=${usersId}`);
  console.log(`APPWRITE_BROKER_ACCOUNTS_COLLECTION_ID=${brokerId}`);
  console.log(`APPWRITE_STORAGE_BUCKET_ID=${bucketId}`);
  console.log("────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
