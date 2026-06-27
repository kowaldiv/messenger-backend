import { FastifyInstance } from "fastify";
import { AuthRepository } from "./interfaces/auth.repository.interface.js";

export function authRepository(instance: FastifyInstance): AuthRepository {
  const prisma = instance.prisma;

  const findByEmailWithCredentials = async (email: string) => {
    const user = prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        globalRole: true,
      },
    });
    return user;
  };
  return {
    findByEmailWithCredentials,
  };
}
