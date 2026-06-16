import { FastifyInstance } from "fastify";
import { TokenRepository } from "./interface.js";

export function tokenRepository(instance: FastifyInstance): TokenRepository {
  const prisma = instance.prisma;
  
  // -------- токены -----------

  const allSessions = async (userId: string) => {
    const sessions = await prisma.sessions.findMany({
      where: {
        userId,
        tokenType: "refresh",
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        userId: true,
        fingerprint: true,
        createdAt: true,
      },
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
    const session = await prisma.sessions.create({
      data: {
        userId: data.userId,
        token: data.token,
        tokenType: data.tokenType,
        fingerprint: data.fingerprint,
        expiresAt: data.expiresAt,
      },
      select: {
        token: true,
        expiresAt: true,
      },
    });
    return session;
  };

  // ---------- валидация ------------

  const isTokenValidByToken = async (token: string) => {
    const session = await prisma.sessions.findUnique({
      where: {
        token: token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    return session;
  };

  const isTokenValidById = async (id: string) => {
    const session = await prisma.sessions.findUnique({
      where: {
        id: id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    return session;
  };

  // ----------- удалеение ------------

  const deleteTokenByToken = async (token: string) => {
    await prisma.sessions.delete({
      where: { token },
    });
  };

  const deleteTokenById = async (tokenId: string, userId: string) => {
    await prisma.sessions.delete({
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
