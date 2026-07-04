import { ConflictError, NotFoundError } from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { MessageRepository } from "../repositories/interfaces/message.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import { MessageService } from "./interfaces/message.service.interface.js";
import { config } from "../config/index.js";
import { InviteLinkRepository } from "../repositories/interfaces/invite-link.repository.interface.js";
import { normalizeMessage } from "./transformers/message.transformer.js";
import { transformChat } from "./transformers/chat.transformer.js";

export function messageService(
  messageRepository: MessageRepository,
  chatRepository: ChatRepository,
  userRepository: UserRepository,
  inviteLinkRepository: InviteLinkRepository,
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

    // проверяем чат
    const chat = await chatRepository.findById(chatIdOrUserId);

    if (chat) {
      // Чат существует — отправляем сообщение в существующий чат
      const message = await messageRepository.create({
        userId,
        chatId: chat.id,
        type: "text",
        text,
        replyToId,
        attachments,
      });

      return {
        message: normalizeMessage(message),
        isNewChat: false,
        chatId: chat.id,
      };
    }

    // чат не найден - проверяем, может это ID пользователя
    const recipientExists = await userRepository.findById(chatIdOrUserId);
    if (!recipientExists) {
      throw new NotFoundError("USER_AND_CHAT_NOT_FOUND");
    }

    if (userId === chatIdOrUserId) {
      throw new Error("CANNOT_SEND_MESSAGE_TO_SELF");
    }

    // Проверяем, есть ли уже приватный чат между пользователями
    const existingChat = await chatRepository.haveUsersPrivateChat(
      userId,
      chatIdOrUserId,
    );

    let targetChatId: string;
    let isNewChat: boolean;

    if (existingChat) {
      // Чат уже существует — используем его
      targetChatId = existingChat.id;
      isNewChat = false;
    } else {
      // Создаём новый чат
      const newChat = await chatRepository.create({ type: "private" }, userId);
      await Promise.all([
        chatRepository.addParticipant(newChat.id, userId, "member"),
        chatRepository.addParticipant(newChat.id, chatIdOrUserId, "member"),
      ]);
      targetChatId = newChat.id;
      isNewChat = true;
    }

    // создаём сообщение
    const message = await messageRepository.create({
      userId,
      chatId: targetChatId,
      type: "text",
      text,
      replyToId,
      attachments,
    });

    // Если чат новый — возвращаем полные данные
    if (isNewChat) {
      const fullChat = await chatRepository.findFullChatById(
        targetChatId,
        userId,
      );
      return {
        message: normalizeMessage(message),
        isNewChat: true,
        chatId: targetChatId,
        chat: fullChat ? transformChat(fullChat) : undefined,
      };
    }

    // Если чат существующий — возвращаем только ID
    return {
      message: normalizeMessage(message),
      isNewChat: false,
      chatId: targetChatId,
    };
  };

  const sendInviteToChat = async (
    userId: string,
    destinationChatId: string,
    chatIdOrUserIds: string[],
  ) => {
    // проверяем чат назначения
    const destinationChat = await chatRepository.findById(destinationChatId);
    if (!destinationChat) {
      throw new NotFoundError("CHAT_NOT_FOUND");
    }

    if (destinationChat.type === "private") {
      throw new ConflictError("YOU_CANT_INVITE_TO_PRIVATE_CHAT");
    }

    // проверяем, что пользователь в чате назначения
    const userInDestinationChat = await chatRepository.userInChat(
      userId,
      destinationChatId,
    );
    if (!userInDestinationChat) {
      throw new ConflictError("USER_NOT_IN_CHAT");
    }

    // обрабатываем каждый ID как chat или user
    const processedChats = await Promise.all(
      chatIdOrUserIds.map(async (id) => {
        // ищем чат
        let chat = await chatRepository.findById(id);
        let isNewChat = false;
        let invitedUserId = null;

        // если чат не найден, ищем пользователя
        if (!chat) {
          const user = await userRepository.findById(id);
          if (!user) {
            throw new NotFoundError(`USER_OR_CHAT_NOT_FOUND: ${id}`);
          }
          if (userId === id) {
            throw new Error("CANNOT_INVITE_SELF");
          }

          // создаем приватный чат с пользователем
          chat = await chatRepository.create({ type: "private" }, userId);
          isNewChat = true;
          invitedUserId = id; // сохраняем ID приглашенного пользователя
          await Promise.all([
            chatRepository.addParticipant(chat.id, userId, "member"),
            chatRepository.addParticipant(chat.id, id, "member"),
          ]);
        }

        // проверяем, что пользователь в чате
        const userInChat = await chatRepository.userInChat(userId, chat.id);
        if (!userInChat) {
          throw new ConflictError(`USER_NOT_IN_CHAT: ${chat.id}`);
        }

        return { chatId: chat.id, isNewChat, invitedUserId };
      }),
    );

    // создаем инвайт линк
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + config.INVITE_LINK_LIVE_HOURS);

    const inviteLink = await inviteLinkRepository.create(
      token,
      expiresAt,
      destinationChatId,
    );

    // создаем сообщение для каждого чата
    const messages = await Promise.all(
      processedChats.map(({ chatId, isNewChat, invitedUserId }) =>
        messageRepository
          .create({
            userId,
            chatId,
            type: "invite",
            metadata: inviteLink,
          })
          .then((message) => ({
            message: normalizeMessage(message),
            isNewChat,
            chatId,
            ...(isNewChat && { invitedUserId }), // добавляем поле только если чат новый
          })),
      ),
    );

    return messages;
  };

  return {
    create,
    sendInviteToChat,
  };
}
