import { type FastifyInstance } from "fastify";
import { CreateUserInput, UpdateUserProfileInput, UserRepository } from "./interfaces/user.repository.interface.js";

export function userRepository(instance: FastifyInstance): UserRepository {
  const prisma = instance.prisma;

  const findById = async (id: string) => {
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

  const findByEmail = async (email: string) => {
    const user = await prisma.users.findUnique({
      where: { email },
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

  // --------- создание -----------

  const create = async (data: CreateUserInput) => {
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

  // ------ обновление -------

  const updateProfile = async (id: string, data: UpdateUserProfileInput) => {
    const user = await prisma.users.update({
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

  const updatePassword = async (
    id: string,
    newPasswordHash: string,
  ): Promise<void> => {
    await prisma.users.update({
      where: { id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });
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

  const existsById = async (id: string): Promise<boolean> => {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    return user !== null;
  };

  const existsByUsername = async (username: string): Promise<boolean> => {
    const user = await prisma.users.findUnique({
      where: { username },
    });
    return user !== null;
  };

  const existsByEmail = async (email: string): Promise<boolean> => {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    return user !== null;
  };

  return {
    findById,
    findByEmail,
    create,
    updateProfile,
    updatePassword,
    updateLastSeen,
    banUser,
    existsById,
    existsByUsername,
    existsByEmail,
  };
}
