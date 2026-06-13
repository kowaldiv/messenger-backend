import { type FastifyInstance } from "fastify";
import type {
  Avatar,
  CreateUserInput,
  PublicUser,
  PublicUserWithAvatars,
  UserRepository,
} from "./interface.js";

export function userRepository(instance: FastifyInstance): UserRepository {
  const prisma = instance.prisma;

  const findById = async (id: string): Promise<PublicUser | null> => {
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
      },
    });
    return user;
  };

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

  const findByIdWithAvatars = async (
    id: string,
  ): Promise<PublicUserWithAvatars | null> => {
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

  // const findByEmail = async (email: string) => {
  //   const user = prisma.users.findUnique({
  //     where: { email },
  //     select: {
  //       id: true,
  //       username: true,
  //       email: true,
  //       passwordHash: true,
  //       globalRole: true,
  //     },
  //   });
  //   return user;
  // };

  // const findByUsername = async (username: string) => {
  //   return prisma.users.findUnique({
  //     where: { username },
  //     select: {
  //       id: true,
  //       username: true,
  //       firstName: true,
  //       lastName: true,
  //       bio: true,
  //       lastSeen: true,
  //       createdAt: true,
  //     },
  //   });
  // };

  const findManyByUsernameWithPrimaryAvatar = async (
    usernamePattern: string,
  ): Promise<PublicUserWithAvatars[]> => {
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

  // --------- создание -----------

  const create = async (data: CreateUserInput): Promise<PublicUser> => {
    const user = prisma.users.create({
      data: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.passwordHash,
        lastSeen: new Date(),
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        lastSeen: true,
        createdAt: true,
      },
    });
    return user;
  };

  // ------ обновление -------

  const update = async (
    id: string,
    data: CreateUserInput,
  ): Promise<PublicUser> => {
    const user = prisma.users.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        lastSeen: true,
        createdAt: true,
      },
    });
    return user;
  };

  const updateLastSeen = async (id: string): Promise<void> => {
    await prisma.users.update({
      where: { id },
      data: { lastSeen: new Date() },
    });
  };

  // ------- удаление --------

  const banUser = async (id: string): Promise<void> => {
    await prisma.users.update({
      where: { id },
      data: { isBanned: true },
    });
  };

  // -------- проверки ---------

  const existsByUsername = async (username: string): Promise<boolean> => {
    const count = await prisma.users.count({
      where: { username },
    });
    return count > 0;
  };

  const existsByEmail = async (email: string): Promise<boolean> => {
    const count = await prisma.users.count({
      where: { email },
    });
    return count > 0;
  };

  // ------ аватары --------

  const addAvatar = async (
    userId: string,
    avatarUrl: string,
  ): Promise<Avatar> => {
    await prisma.avatars.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    const newAvatar = await prisma.avatars.create({
      data: {
        userId,
        avatarUrl,
        isPrimary: true,
        entityType: "user",
      },
      select: {
        id: true,
        avatarUrl: true,
        isPrimary: true,
        createdAt: true,
      },
    });
    return newAvatar;
  };

  const setPrimaryAvatar = async (
    userId: string,
    avatarId: string,
  ): Promise<void> => {
    await prisma.$transaction([
      prisma.avatars.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      }),

      prisma.avatars.update({
        where: { userId, id: avatarId },
        data: { isPrimary: true },
      }),
    ]);
  };

  const deleteAvatar = async (
    avatarId: string,
    userId: string,
  ): Promise<void> => {
    await prisma.avatars.delete({
      where: { id: avatarId, userId },
    });
  };

  return {
    findById,
    findByIdWithPrimaryAvatar,
    findByIdWithAvatars,
    findManyByUsernameWithPrimaryAvatar,
    create,
    update,
    updateLastSeen,
    banUser,
    existsByUsername,
    existsByEmail,
    addAvatar,
    setPrimaryAvatar,
    deleteAvatar,
  };
}
