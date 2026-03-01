import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createAdminClient } from "@/lib/appwrite/server";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_USERS_COLLECTION_ID,
} from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const { databases } = await createAdminClient();
        const users = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_USERS_COLLECTION_ID,
          [Query.equal("email", email), Query.limit(1)],
        );

        if (users.documents.length === 0) return null;

        const user = users.documents[0];
        if (!user.password_hash) return null; // Google-only user

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.$id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/sign-up",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        // Auto-create user in Appwrite if not exists
        const { databases } = await createAdminClient();
        const existing = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_USERS_COLLECTION_ID,
          [Query.equal("email", user.email), Query.limit(1)],
        );

        if (existing.documents.length === 0) {
          const doc = await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_USERS_COLLECTION_ID,
            ID.unique(),
            {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              password_hash: null,
              provider: "google",
            },
          );
          user.id = doc.$id;
        } else {
          user.id = existing.documents[0].$id;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
});
