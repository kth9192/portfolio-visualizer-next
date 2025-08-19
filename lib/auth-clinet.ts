import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  fetchOptions: {
    credentials: "include",

    // onResponse: async (context) => {
    //   const contentType = context.response.headers.get("content-type");
    //   // if (!contentType.includes("application/json")) {
    //   //   console.error("response is not json", await context.response.text());
    //   //   throw new Error("Invalid response format");
    //   // }

    //   console.log(context.response);

    //   return context.response.json();
    // },
    // onError: (context) => console.error("Error", context.error),
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
