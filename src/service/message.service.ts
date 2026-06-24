import { ConflictError, NotFoundError } from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { MessageRepository } from "../repositories/interfaces/message.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import { MessageService } from "./interfaces/message.service.interface.js";

export function messageService(
  messageRepository: MessageRepository,
  chatRepository: ChatRepository,
  userRepository: UserRepository,
): MessageService {
  const create = async (
    userId: string,
    chatIdOrUserId: string,
    text: string,
    replyToId?: string,
    attachments?: {
      fileUrl: string;
      fileType: string;
      fileName: string;
    }[],
  ) => {
    // проверяем отправителя
    const senderExists = await userRepository.existsById(userId);
    if (!senderExists) {
      throw new NotFoundError("USER_NOT_FOUND");
    }

    let chatId = chatIdOrUserId;
    let isNewChat = false;

    // проверяем чат
    const chat = await chatRepository.findById(chatIdOrUserId);
    if (!chat) {
      const recipientExists = await userRepository.findById(chatIdOrUserId);
      if (!recipientExists) {
        throw new NotFoundError("USER_OR_CHAT_NOT_FOUND");
      }
      if (userId === chatIdOrUserId) {
        throw new Error("CANNOT_SEND_MESSAGE_TO_SELF");
      }
      // создаем чат
      const newChat = await chatRepository.create({
        type: "private",
      });
      chatId = newChat.id;
      isNewChat = true;
      // добавляем пользователей
      await chatRepository.addParticipant(newChat.id, userId, "member");
      await chatRepository.addParticipant(newChat.id, chatIdOrUserId, "member");
    } else {
      const userInChat = await chatRepository.userInChat(userId, chat.id);
      if (!userInChat) {
        throw new ConflictError("USER_NOT_IN_CHAT");
      }

      if (chat.type === "channel" && userInChat.role !== "owner") {
        throw new ConflictError("YOU_NOT_A_OWNER_OF_THIS_CHANNEL");
      }
    }

    const message = await messageRepository.create(
      userId,
      chatId,
      text,
      replyToId,
      attachments,
    );

    return {
      message,
      isNewChat,
      chatId,
    };
  };

  return {
    create,
  };
}
