import { FastifyInstance } from "fastify";
import { AvatarRepository } from "./interface.js";

export function avatarRepository(instance: FastifyInstance): AvatarRepository {
  const prisma = instance.prisma;

  // ------ аватары --------

  const addAvatar = async (userId: string, avatarUrl: string) => {
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

  const setPrimaryAvatar = async (userId: string, avatarId: string) => {
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

  const deleteAvatar = async (avatarId: string, userId: string) => {
    await prisma.avatars.delete({
      where: { id: avatarId, userId },
    });
  };

  return {
    addAvatar,
    setPrimaryAvatar,
    deleteAvatar,
  };
}
