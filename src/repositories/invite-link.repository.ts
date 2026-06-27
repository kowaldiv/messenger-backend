import { FastifyInstance } from "fastify";
import {
  InviteLinkRepository,
  PublicInviteLink,
} from "./interfaces/invite-link.repository.interface.js";
import { PublicInviteLinkSelect } from "./prisma/selects/inviteLink.selects.js";

export function inviteLinkRepository(
  instance: FastifyInstance,
): InviteLinkRepository {
  const prisma = instance.prisma;

  const create = async (token: string, expiresAt: Date, chatId: string) => {
    const inviteLink = await prisma.inviteLink.create({
      data: {
        token,
        expiresAt,
        chatId,
      },
      select: PublicInviteLinkSelect,
    });
    return inviteLink as unknown as PublicInviteLink;
  };

  const findBytoken = async (token: string) => {
    const inviteLink = await prisma.inviteLink.findUnique({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: PublicInviteLinkSelect,
    });
    if (!inviteLink) return null;
    return inviteLink as unknown as PublicInviteLink;
  };

  return {
    create,
    findBytoken,
  };
}
