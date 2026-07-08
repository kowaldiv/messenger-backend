import { BadRequestError, NotFoundError } from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { InviteLinkRepository } from "../repositories/interfaces/invite-link.repository.interface.js";
import { MessageRepository } from "../repositories/interfaces/message.repository.interface.js";
import { UnreadRepository } from "../repositories/interfaces/unread.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import {
  ChatService,
  CreateChatWithCreator,
} from "./interfaces/chat.service.interface.js";
import { transformChat } from "./transformers/chat.transformer.js";
import { participantTransformer } from "./transformers/participant.transformer.js";

export function chatService(
  chatRepository: ChatRepository,
  userRepository: UserRepository,
  unreadRepository: UnreadRepository,
  inviteLinkRepository: InviteLinkRepository,
  messageRepository: MessageRepository,
): ChatService {
  const create = async (data: CreateChatWithCreator) => {
    const isUserExist = await userRepository.existsById(data.creatorId);
    if (!isUserExist) {
      throw new NotFoundError("USER_NOT_FOUND");
    }

    if (data.type === "channel") {
      const fullChat = await chatRepository.create(
        {
          type: data.type,
          title: data.title,
          description: data.description,
          isPrivate: data.isPrivate,
        },
        data.creatorId,
      );

      await chatRepository.addParticipant(fullChat.id, data.creatorId, "owner");

      const userParticipant = await chatRepository.findUserParticipantInChat(
        data.creatorId,
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

      return transformChat(
        fullChat,
        unreadCountsForChat,
        userParticipantWithUnread,
      );
    } else {
      const fullChat = await chatRepository.create(
        {
          type: data.type,
          title: data.title,
        },
        data.creatorId,
      );

      await chatRepository.addParticipant(fullChat.id, data.creatorId, "owner");

      const userParticipant = await chatRepository.findUserParticipantInChat(
        data.creatorId,
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

      return transformChat(
        fullChat,
        unreadCountsForChat,
        userParticipantWithUnread,
      );
    }
  };

  const joinChat = async (
    userId: string,
    options: {
      inviteLinkToken?: string;
      chatId?: string;
    },
  ) => {
    // Проверяем пользователя
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("USER_NOT_FOUND");
    }

    if (options.inviteLinkToken) {
      // Вход по инвайт-ссылке
      const inviteLink = await inviteLinkRepository.findBytoken(
        options.inviteLinkToken,
      );
      if (!inviteLink) throw new NotFoundError("INVITE_LINK_BAD_OR_EXPIRED");

      const chatId = inviteLink.chat.id;

      const fullChat = await chatRepository.findFullChatById(chatId, userId);
      if (!fullChat) throw new NotFoundError("CHAT_NOT_FOUND");
      if (fullChat.type === "private")
        throw new BadRequestError("Ссылка устаревшая или плохая");
      if (
        fullChat.type === "channel" &&
        fullChat.channelSettings.isPrivate === false
      )
        throw new BadRequestError("Ссылка устаревшая или плохая");
      if (
        fullChat.type === "channel" &&
        fullChat.channelSettings.isPrivate === true
      ) {
        await inviteLinkRepository.remove(inviteLink.id);
      }

      // Создаем сообщение о присоединении
      await messageRepository.create({
        chatId,
        userId,
        type: "joined",
        metadata: {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        },
      });
      await chatRepository.addParticipant(chatId, userId, "member");

      if (!fullChat) throw new NotFoundError("CHAT_NOT_FOUND_AFTER_JOIN");

      const userParticipant = await chatRepository.findUserParticipantInChat(
        userId,
        chatId,
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

      return transformChat(
        fullChat,
        unreadCountsForChat,
        userParticipantWithUnread,
      );
    } else if (options.chatId) {
      // Прямой вход по ID чата
      const chatId = options.chatId;
      const fullChat = await chatRepository.findFullChatById(chatId, userId);
      if (!fullChat) throw new NotFoundError("CHAT_NOT_FOUND");
      if (fullChat.type === "private")
        throw new BadRequestError("Ссылка устаревшая или плохая");
      if (fullChat.type === "group")
        throw new BadRequestError("Ссылка устаревшая или плохая");
      if (
        fullChat.type === "channel" &&
        fullChat.channelSettings.isPrivate === true
      )
        throw new BadRequestError("Ссылка устаревшая или плохая");

      await chatRepository.addParticipant(chatId, userId, "member");

      if (!fullChat) throw new NotFoundError("CHAT_NOT_FOUND_AFTER_JOIN");

      const userParticipant = await chatRepository.findUserParticipantInChat(
        userId,
        chatId,
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

      return transformChat(
        fullChat,
        unreadCountsForChat,
        userParticipantWithUnread,
      );
    } else {
      throw new BadRequestError("EITHER_INVITE_LINK_OR_CHAT_ID_REQUIRED");
    }
  };

  const getAllUserChats = async (userId: string) => {
    const isUserExist = await userRepository.existsById(userId);
    if (!isUserExist) throw new NotFoundError("USER_NOT_FOUND");

    const chats = await chatRepository.findAllUserChats(userId);
    if (chats.length === 0) return [];

    const chatIds = chats.map((c) => c.id);

    // Получаем участников пользователя во всех чатах
    const userParticipants = await chatRepository.findUserParticipantsInChats(
      userId,
      chatIds,
    );

    // Создаём Map для быстрого доступа к участникам
    const participantMap = new Map(userParticipants.map((p) => [p.chatId, p]));

    // Получаем количество непрочитанных для всех чатов одним запросом
    const unreadCountsForChats =
      await unreadRepository.getUnreadCountsForChats(chatIds);

    // Создаём Map для быстрого доступа к данным о непрочитанных
    const unreadMap = new Map(
      unreadCountsForChats.map((item) => [
        item.chatId,
        item.participantsUnread,
      ]),
    );

    // Трансформируем все чаты
    const result = chats.map((chat) => {
      const myParticipant = participantMap.get(chat.id);
      if (!myParticipant) return null;

      // Получаем данные о непрочитанных для этого чата
      const participantsUnread = unreadMap.get(chat.id) || [];

      // Находим unread для текущего пользователя
      const myUnread = participantsUnread.find((p) => p.userId === userId);
      const myUnreadCount = myUnread ? Number(myUnread.unread) : 0;

      // Трансформируем участника с unread
      const userParticipantWithUnread = participantTransformer(
        myParticipant,
        myUnreadCount,
      );

      // Трансформируем чат, передавая все данные о непрочитанных для всех участников
      return transformChat(chat, participantsUnread, userParticipantWithUnread);
    });

    return result.filter((chat) => chat !== null);
  };

  const updateLastReadMessageTime = async (userId: string, chatId: string) => {
    const isUserInChat = await chatRepository.userInChat(userId, chatId);
    if (!isUserInChat) throw new BadRequestError("Пользователь не в чате");

    await chatRepository.updateLastReadMessageTime(userId, chatId);
  };

  return {
    create,
    joinChat,
    // getChatParticipants,
    getAllUserChats,
    updateLastReadMessageTime,
  };
}
