import { FastifyInstance } from "fastify";
import { TokenRepository } from "./interfaces/token.repository.interface.js";
import { publicTokenInfoSelect } from "./prisma/selects/token.selects.js";

export function tokenRepository(instance: FastifyInstance): TokenRepository {
  const prisma = instance.prisma;

  // -------- токены -----------

  const allSessions = async (userId: string) => {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        tokenType: "refresh",
        expiresAt: {
          gt: new Date(),
        },
      },
      select: publicTokenInfoSelect,
    });
    return sessions;
  };

  // ------------- создание -------------

  const createToken = async (data: {
    userId: string;
    token: string;
    tokenType: "refresh" | "reset_password";
    fingerprint: string;
    expiresAt: Date;
  }) => {
    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        tokenType: data.tokenType,
        fingerprint: data.fingerprint,
        expiresAt: data.expiresAt,
      },
      select: publicTokenInfoSelect,
    });
    return session;
  };

  // ---------- валидация ------------

  const isTokenValidByToken = async (token: string) => {
    const session = await prisma.session.findUnique({
      where: {
        token: token,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: publicTokenInfoSelect,
    });
    return session;
  };

  const isTokenValidById = async (id: string) => {
    const session = await prisma.session.findUnique({
      where: {
        id: id,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: publicTokenInfoSelect,
    });
    return session;
  };

  // ----------- удалеение ------------

  const deleteTokenByToken = async (token: string) => {
    await prisma.session.delete({
      where: { token },
    });
  };

  const deleteTokenById = async (tokenId: string, userId: string) => {
    await prisma.session.delete({
      where: { id: tokenId, userId },
    });
  };

  return {
    allSessions,
    createToken,
    isTokenValidByToken,
    isTokenValidById,
    deleteTokenByToken,
    deleteTokenById,
  };
}
