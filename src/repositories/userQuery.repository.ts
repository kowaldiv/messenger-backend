import { FastifyInstance } from "fastify";
import { UserQueryRepository } from "./interfaces/userQuery.repository.interface.js";
import { publicUserSelect, publicUserWithOneAvatarSelect } from "./prisma/selects/user.selects.js";

export function userQueryRepository(
  instance: FastifyInstance,
): UserQueryRepository {
  const prisma = instance.prisma;

  const findByIdWithPrimaryAvatar = async (id: string) => {
    const user = prisma.user.findUnique({
      where: { id },
      select: publicUserWithOneAvatarSelect,
    });
    return user;
  };

  const findByIdWithAvatars = async (id: string) => {
    const user = prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    return user;
  };

  const findByEmailWithAvatars = async (email: string) => {
    const user = prisma.user.findUnique({
      where: { email },
      select: publicUserSelect,
    });
    return user;
  };

  const findManyByUsernamePatternWithPrimaryAvatar = async (
    usernamePattern: string,
  ) => {
    const users = prisma.user.findMany({
      where: {
        username: {
          contains: usernamePattern,
          mode: "insensitive",
        },
      },
      select: publicUserWithOneAvatarSelect,
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
