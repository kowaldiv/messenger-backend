import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { MessageRepository } from "../repositories/interfaces/message.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import { MessageService } from "./interfaces/message.service.interface.js";
import { config } from "../config/index.js";
import { InviteLinkRepository } from "../repositories/interfaces/invite-link.repository.interface.js";
import { normalizeMessage } from "./transformers/message.transformer.js";
import { transformChat } from "./transformers/chat.transformer.js";
import { UnreadRepository } from "../repositories/interfaces/unread.repository.interface.js";
import { participantTransformer } from "./transformers/participant.transformer.js";

export function messageService(
  messageRepository: MessageRepository,
  chatRepository: ChatRepository,
  unreadRepository: UnreadRepository,
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
      if (chat.type === "channel") {
        const isOwner = await chatRepository.ensureUserIsChatOwner(
          userId,
          chat.id,
        );
        if (!isOwner) {
          throw new BadRequestError(
            "Нельзя отправлять сообщение не в свой канал",
          );
        }
      }
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
      if (!fullChat) throw new NotFoundError("Чат не найден");

      const userParticipant = await chatRepository.findUserParticipantInChat(
        userId,
        fullChat.id,
      );
      if (!userParticipant)
        throw new NotFoundError("Пользватель не найден в чате");
      const unread = await unreadRepository.getUnreadCount(
        userParticipant.user.id,
        userParticipant.chatId,
      );
      const userParticipantWithUnread = participantTransformer(
        userParticipant,
        unread,
      );

      const unreadCountsForChat = await unreadRepository.getUnreadCountsForChat(
        fullChat.id,
      );

      return {
        message: normalizeMessage(message),
        isNewChat: true,
        chatId: targetChatId,
        chat: transformChat(
          fullChat,
          unreadCountsForChat,
          userParticipantWithUnread,
        ),
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
    chatIds: string[],
  ) => {
    // проверяем чат назначения
    const destinationChat = await chatRepository.findFullChatById(
      destinationChatId,
      userId,
    );
    if (!destinationChat) {
      throw new NotFoundError("CHAT_NOT_FOUND");
    }
    if (destinationChat.type === "private") {
      throw new ConflictError("YOU_CANT_INVITE_TO_PRIVATE_CHAT");
    }
    // проверяем, что пользователь в чате назначения
    const userInDestinationChat = await chatRepository.userInChat(
      destinationChatId,
      userId,
    );
    if (!userInDestinationChat) {
      throw new ConflictError("USER_NOT_IN_CHAT");
    }

    // обрабатываем каждый ID как chat или user
    const processedChats = await Promise.all(
      chatIds.map(async (chatId) => {
        // ищем чат
        const chat = await chatRepository.findFullChatById(chatId, userId);

        // если чат не найден, ищем пользователя
        if (!chat) {
          throw new NotFoundError(
            "Нету чата в который вы пытаетесь отправить ссылку",
          );
        }
        // проверяем, что пользователь в чате
        const userInChat = await chatRepository.userInChat(chat.id, userId);
        if (!userInChat) {
          throw new ConflictError(`USER_NOT_IN_CHAT`);
        }
        if (chat.type === "channel") {
          const isOwner = await chatRepository.ensureUserIsChatOwner(
            userId,
            chatId,
          );
          if (!isOwner) {
            throw new BadRequestError(
              "Нельзя отправлять сообщение не в свой канал",
            );
          }
        }

        return { chatId: chat.id };
      }),
    );

    if (
      destinationChat.type === "channel" &&
      destinationChat.channelSettings.isPrivate
    ) {
      const messages = await Promise.all(
        processedChats.map(({ chatId }) =>
          messageRepository
            .create({
              userId,
              chatId,
              type: "invite",
              metadata: {
                chat: {
                  title: destinationChat.title,
                  avatars: destinationChat.avatars,
                },
              },
            })
            .then((message) => ({
              chatId,
              message: normalizeMessage(message),
            })),
        ),
      );
      return messages;
    }

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
      processedChats.map(({ chatId }) =>
        messageRepository
          .create({
            userId,
            chatId,
            type: "invite",
            metadata: inviteLink,
          })
          .then((message) => ({
            chatId,
            message: normalizeMessage(message),
          })),
      ),
    );

    return messages;
  };

  // ------------- получение сообщений ---------------------

  const getMessages = async ({
    chatId,
    beforeId,
    limit = 30,
  }: {
    chatId: string;
    beforeId?: string;
    limit?: number;
  }) => {
    const messages = await messageRepository.getMessages({
      chatId,
      beforeId,
      limit,
    });

    return {
      messages: messages.map((message) => normalizeMessage(message)),
      hasMore: messages.length === limit,
    };
  };

  return {
    create,
    sendInviteToChat,
    getMessages,
  };
}
