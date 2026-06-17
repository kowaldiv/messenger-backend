import { FastifyInstance } from "fastify";
import { AvatarRepository } from "./interfaces/avatar.repository.interface.js";

export function avatarRepository(instance: FastifyInstance): AvatarRepository {
  const prisma = instance.prisma;

  const findAvatar = async (
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ) => {
    const whereCondition =
      entityType === "user" ? { userId: entityId } : { chatId: entityId };
    const avatar = await prisma.avatars.findUnique({
      where: {
        ...whereCondition,
        id: avatarId,
      },
      select: {
        id: true,
        avatarUrl: true,
        isPrimary: true,
        createdAt: true,
      },
    });
    return avatar;
  };

  const findAvatars = async (entityType: "user" | "chat", entityId: string) => {
    const whereCondition =
      entityType === "user" ? { userId: entityId } : { chatId: entityId };
    const avatar = await prisma.avatars.findMany({
      where: {
        ...whereCondition,
      },
      select: {
        id: true,
        avatarUrl: true,
        isPrimary: true,
        createdAt: true,
      },
    });
    return avatar;
  };

  // ------ аватары --------

  const addAvatar = async (
    entityType: "user" | "chat",
    entityId: string,
    avatarUrl: string,
  ) => {
    const whereCondition =
      entityType === "user" ? { userId: entityId } : { chatId: entityId };
    await prisma.avatars.updateMany({
      where: {
        ...whereCondition,
        isPrimary: true,
      },
      data: { isPrimary: false },
    });

    const newAvatar = await prisma.avatars.create({
      data: {
        ...whereCondition,
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
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ) => {
    const whereCondition =
      entityType === "user" ? { userId: entityId } : { chatId: entityId };
    await prisma.$transaction([
      prisma.avatars.updateMany({
        where: {
          ...whereCondition,
          isPrimary: true,
        },
        data: { isPrimary: false },
      }),

      prisma.avatars.update({
        where: {
          ...whereCondition,
          id: avatarId,
        },
        data: { isPrimary: true },
      }),
    ]);
  };

  const deleteAvatar = async (
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ) => {
    const whereCondition =
      entityType === "user" ? { userId: entityId } : { chatId: entityId };
    await prisma.avatars.delete({
      where: {
        ...whereCondition,
        id: avatarId,
      },
    });
  };

  return {
    findAvatar,
    findAvatars,
    addAvatar,
    setPrimaryAvatar,
    deleteAvatar,
  };
}
