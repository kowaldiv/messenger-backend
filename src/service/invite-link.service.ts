import { ConflictError } from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { InviteLinkRepository } from "../repositories/interfaces/invite-link.repository.interface.js";

export function inviteLinkService(
  inviteLinkRepository: InviteLinkRepository,
  chatRepository: ChatRepository,
) {
  const create = async (userId: string, chatId: string) => {
    const isUserInChat = await chatRepository.userInChat(userId, chatId);
    if (!isUserInChat) {
      throw new ConflictError("USER_NOT_IN_CHAT");
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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
