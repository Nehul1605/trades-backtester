import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

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

        try {
          const res = await fetch(
            `${BACKEND_URL}/api/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            }
          );

          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          if (data && data.token) {
            return {
              id: data.id,
              email: data.email,
              name: data.name,
              token: data.token,
              status: data.status,
              role: data.role,
              image: data.image || "",
            };
          }
          return null;
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
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
        try {
          const res = await fetch(
            `${BACKEND_URL}/api/auth/google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
              }),
            }
          );

          if (!res.ok) {
            return false;
          }

          const data = await res.json();
          if (data && data.token) {
            user.id = data.id;
            (user as any).token = data.token;
            (user as any).status = data.status;
            (user as any).role = data.role;
            (user as any).image = data.image || user.image || "";
            return true;
          }
          return false;
        } catch (error) {
          console.error("Google signin callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.accessToken = (user as any).token;
        token.status = (user as any).status;
        token.role = (user as any).role;
        token.picture = (user as any).image || user.image || "";
      }
      if (trigger === "update" && session) {
        token.status = session.status ?? token.status;
        token.role = session.role ?? token.role;
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
      }
      if (token.status !== "approved" && token.accessToken) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/verification/status`, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status) {
              token.status = data.status;
            }
            if (data.role) {
              token.role = data.role;
            }
          }
        } catch (error) {
          console.error("JWT live status check error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
        (session.user as any).accessToken = token.accessToken as string;
        (session.user as any).status = token.status as string;
        (session.user as any).role = token.role as string;
        if (token.name) session.user.name = token.name as string;
        if (token.picture !== undefined) session.user.image = token.picture as string;
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
