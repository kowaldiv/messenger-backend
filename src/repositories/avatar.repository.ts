import { FastifyInstance } from "fastify";
import { AvatarRepository } from "./interfaces/avatar.repository.interface.js";
import { Prisma } from "../generated/prisma/browser.js";
import { avatarSelect } from "./prisma/selects/user.selects.js";

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
      select: avatarSelect
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
      select: avatarSelect
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
      select: avatarSelect
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
    const lastAdded = await prisma.avatars.findFirst({
      where: { ...whereCondition, NOT: { id: avatarId } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const operations: Prisma.PrismaPromise<any>[] = [];

    operations.push(
      prisma.avatars.delete({
        where: {
          ...whereCondition,
          id: avatarId,
        },
      }),
    );

    if (lastAdded) {
      operations.push(
        prisma.avatars.update({
          where: {
            ...whereCondition,
            id: lastAdded.id,
          },
          data: { isPrimary: true },
        }),
      );
    }

    await prisma.$transaction(operations);
  };

  return {
    findAvatar,
    findAvatars,
    addAvatar,
    setPrimaryAvatar,
    deleteAvatar,
  };
}
