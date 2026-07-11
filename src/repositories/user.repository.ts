import { type FastifyInstance } from "fastify";
import {
  CreateUserInput,
  UpdateUserProfileInput,
  UserRepository,
} from "./interfaces/user.repository.interface.js";
import { publicUserSelect, userSelect } from "./prisma/selects/user.selects.js";

export function userRepository(instance: FastifyInstance): UserRepository {
  const prisma = instance.prisma;

  const findById = async (id: string) => {
    const user = prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    return user;
  };

  const findByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
    return user;
  };

  // --------- создание -----------

  const create = async (data: CreateUserInput) => {
    const user = prisma.user.create({
      data: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.passwordHash,
        lastSeen: new Date(),
      },
      select: publicUserSelect,
    });
    return user;
  };

  // ------ обновление -------

  const updateProfile = async (id: string, data: UpdateUserProfileInput) => {
    await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: userSelect,
    });
  };

  const updatePassword = async (
    id: string,
    newPasswordHash: string,
  ): Promise<void> => {
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });
  };

  const updateLastSeen = async (id: string) => {
    const result = await prisma.user.update({
      where: { id },
      data: { lastSeen: new Date() },
      select: {
        lastSeen: true,
      },
    });
    return result.lastSeen;
  };

  // ------- удаление --------

  const banUser = async (id: string): Promise<void> => {
    await prisma.user.update({
      where: { id },
      data: { isBanned: true },
    });
  };

  // -------- проверки ---------

  const existsById = async (id: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user !== null;
  };

  const existsByUsername = async (username: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return user !== null;
  };

  const existsByEmail = async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user !== null;
  };

  // ----------- поиск ---------------

  const findManyByPattern = async (
    userId: string,
    pattern: string,
    page: number = 1,
    limit: number = 5,
  ) => {
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        username: { contains: pattern, mode: "insensitive" },
      },
      select: publicUserSelect,
      skip,
      take: limit,
    });
    return users;
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
    findManyByPattern,
  };
}
