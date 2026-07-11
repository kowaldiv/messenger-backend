import { ConflictError, NotFoundError } from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { InviteLinkRepository } from "../repositories/interfaces/invite-link.repository.interface.js";
import { config } from "../config/index.js";
import { InviteLinkService } from "./interfaces/invite-link.service.interface.js";

export function inviteLinkService(
  inviteLinkRepository: InviteLinkRepository,
  chatRepository: ChatRepository,
): InviteLinkService {
  const create = async (userId: string, chatId: string) => {
    const chat = await chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundError("CHAT_NOT_FOUND");
    }
    if (chat.type === "private") {
      throw new ConflictError("YOU_CANT_INVITE_TO_PRIVATE_CHAT");
    }
    const isUserInChat = await chatRepository.userInChat(userId, chatId);
    if (!isUserInChat) {
      throw new ConflictError("USER_NOT_IN_CHAT");
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.INVITE_LINK_LIVE_HOURS);
    const inviteLink = await inviteLinkRepository.create(
      token,
      expiresAt,
      chatId,
    );
    return inviteLink;
  };

  return {
    create,
  };
}
