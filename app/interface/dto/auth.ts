import { User as PrismaUser } from "@prisma/client";

export interface AuthUser {
  user: PrismaUser;
  loginResponse: Response;
  credentials: { email: string; password: string };
}

export interface GuestLoginRes {
    user: PrismaUser;
    loginResponse: Response;
}