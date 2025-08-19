import { PrismaClient } from "@prisma/client";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      enabled: process.env.NODE_ENV !== "production",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
  trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : ["http://localhost:3000"],
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      isGuest: {
        type: "boolean",
        input: false,
      },
      guestExpiresAt: {
        type: "date",
        input: false,
      },
    },
  },
} as BetterAuthOptions);

export type AuthUser = typeof auth.$Infer.User;
export type AuthSession = typeof auth.$Infer.Session;
export type Auth = typeof auth;
