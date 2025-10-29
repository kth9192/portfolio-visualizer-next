import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields<typeof auth>({
      user: {
        isGuest: {
          type: "boolean",
        },
        guestExpiresAt: {
          type: "date",
        },
      },
    }),
  ],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
