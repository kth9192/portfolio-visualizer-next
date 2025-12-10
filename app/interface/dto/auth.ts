// import { User as PrismaUser } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@/app/generated/prisma";

type PrismaUser = User;

export interface AuthUser {
  user: PrismaUser;
  loginResponse: Response;
  credentials: { email: string; password: string };
}

export interface GuestLoginRes {
  user: PrismaUser;
  loginResponse: Response;
}
