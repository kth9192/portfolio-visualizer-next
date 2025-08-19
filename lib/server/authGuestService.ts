import { AuthUser } from "@/app/interface/dto/auth";
import { createRandomStringGenerator } from "@better-auth/utils/random";
import { PrismaClient } from "@prisma/client";
import { addHours } from "date-fns";
import { auth } from "../auth";

export class AuthGuestService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async createGuestAccount(): Promise<AuthUser> {
    //인증용 무작위 문자열
    const generateRandomString = createRandomStringGenerator(
      "A-Z",
      "0-9",
      "a-z"
    );

    const guestId = `guest_${generateRandomString(10)}`;
    const guestEmail = `${guestId}@guest.tmp`;
    const guestPassword = generateRandomString(32);

    try {
      const user = await auth.api.signUpEmail({
        body: {
          name: `guest-${guestId}`,
          email: guestEmail,
          password: guestPassword,
        },
      });

      if (!user) {
        throw new Error("게스트 계정 생성에 실패했습니다");
      }

      const updateUser = await this.prisma.user.update({
        where: {
          id: user.user.id,
        },
        data: {
          isGuest: true,
          guestExpiresAt: addHours(new Date(), 24),
        },
      });

      const loginResponse = await auth.api.signInEmail({
        body: {
          email: guestEmail,
          password: guestPassword,
        },
        asResponse: true,
      });

      return {
        user: updateUser,
        loginResponse,
        credentials: {
          email: guestEmail,
          password: guestPassword,
        },
      };
    } catch (error) {
      console.error("createGuestAccount error", error);
      throw new Error("게스트 계정 생성에 실패했습니다");
    }
  }

  async clearGuestAccount(userId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.portfolio_assets.deleteMany({
          where: {
            portfolios: {
              user_id: userId,
            },
          },
        });
        await tx.portfolio_settings.deleteMany({
          where: {
            portfolios: {
              user_id: userId,
            },
          },
        });
        await tx.portfolios.deleteMany({
          where: {
            user_id: userId,
          },
        });

        await tx.session.deleteMany({
          where: {
            user: {
              id: userId,
            },
          },
        });

        await tx.account.deleteMany({
          where: {
            user: {
              id: userId,
            },
          },
        });

        await tx.user.delete({
          where: {
            id: userId,
          },
        });
      });
    } catch (error) {
      console.error("clearGuestAccount error", error);
      throw new Error("게스트 계정 삭제에 실패했습니다");
    }
  }

  async getGuestAccountInfo(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user || !user.isGuest) {
        throw new Error("게스트 계정 정보 조회에 실패했습니다");
      }

      const now = new Date();
      const isExpired = user.guestExpiresAt ? user.guestExpiresAt < now : false;

      return {
        ...user,
        isExpired,
        remainingTime: user.guestExpiresAt
          ? user.guestExpiresAt.getTime() - now.getTime()
          : 0,
      };
    } catch (error) {
      console.error("getGuestAccountInfo error", error);
      throw new Error("게스트 계정 정보 조회에 실패했습니다");
    }
  }
}
