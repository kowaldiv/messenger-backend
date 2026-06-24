import { FastifyInstance } from "fastify";
import { InviteLinkRepository } from "./interfaces/invite-link.repository.interface.js";

export function inviteLinkRepository(
  instance: FastifyInstance,
): InviteLinkRepository {
  const prisma = instance.prisma;

  const create = async (token: string, expiresAt: Date, chatId: string) => {
    const inviteLink = await prisma.inviteLinks.create({
      data: {
        token,
        expiresAt,
        chatId,
      },
    });
    return inviteLink;
  };

  return {
    create,
  };
}
