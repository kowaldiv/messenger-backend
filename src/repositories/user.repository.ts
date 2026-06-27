import { type FastifyInstance } from "fastify";
import { CreateUserInput, UpdateUserProfileInput, UserRepository } from "./interfaces/user.repository.interface.js";
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
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: userSelect,
    });
    return user;
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

  const updateLastSeen = async (id: string): Promise<void> => {
    await prisma.user.update({
      where: { id },
      data: { lastSeen: new Date() },
    });
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
