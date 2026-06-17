import { FastifyInstance } from "fastify";
import { UserQueryRepository } from "./interfaces/userQuery.repository.interface.js";

export function userQueryRepository(
  instance: FastifyInstance,
): UserQueryRepository {
  const prisma = instance.prisma;

  const findByIdWithPrimaryAvatar = async (id: string) => {
    const user = prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        lastSeen: true,
        createdAt: true,
        avatars: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            avatarUrl: true,
            isPrimary: true,
            createdAt: true,
          },
        },
      },
    });
    return user;
  };

  const findByIdWithAvatars = async (id: string) => {
    const user = prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        lastSeen: true,
        createdAt: true,
        avatars: {
          select: {
            id: true,
            avatarUrl: true,
            isPrimary: true,
            createdAt: true,
          },
          orderBy: {
            isPrimary: "desc",
          },
        },
      },
    });
    return user;
  };

  const findByEmailWithAvatars = async (email: string) => {
    const user = prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        lastSeen: true,
        createdAt: true,
        avatars: {
          select: {
            id: true,
            avatarUrl: true,
            isPrimary: true,
            createdAt: true,
          },
          orderBy: {
            isPrimary: "desc",
          },
        },
      },
    });
    return user;
  };

  const findManyByUsernamePatternWithPrimaryAvatar = async (
    usernamePattern: string,
  ) => {
    const users = prisma.users.findMany({
      where: {
        username: {
          contains: usernamePattern,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        lastSeen: true,
        createdAt: true,
        avatars: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            avatarUrl: true,
            isPrimary: true,
            createdAt: true,
          },
        },
      },
      take: 10,
    });
    return users;
  };

  return {
    findByIdWithPrimaryAvatar,
    findByIdWithAvatars,
    findByEmailWithAvatars,
    findManyByUsernamePatternWithPrimaryAvatar,
  };
}
