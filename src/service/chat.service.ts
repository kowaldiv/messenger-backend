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
import { normalizeMessage } from "./transformers/message.transformer.js";
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
      throw new NotFoundError("Пользователь не найден!");
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
      if (!inviteLink) throw new NotFoundError("Ссылка устаревшая или плохая");

      const chatId = inviteLink.chat.id;

      const userParticipantBeforeJoin =
        await chatRepository.findUserParticipantInChat(userId, chatId);
      if (userParticipantBeforeJoin) {
        throw new BadRequestError("Пользователь уже в чате!");
      }

      const fullChat = await chatRepository.findFullChatById(chatId, userId);
      if (!fullChat) throw new NotFoundError("Чат не найден!");
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

      await chatRepository.addParticipant(chatId, userId, "member");

      if (!fullChat)
        throw new NotFoundError("После присоединения чат не был найден!");

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

      if (fullChat.type === "channel") {
        return {
          chat: transformChat(
            fullChat,
            unreadCountsForChat,
            userParticipantWithUnread,
          ),
          newParticipant: userParticipantWithUnread,
        };
      }

      // Создаем сообщение о присоединении
      const newMessage = await messageRepository.create({
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

      return {
        chat: transformChat(
          fullChat,
          unreadCountsForChat,
          userParticipantWithUnread,
        ),
        newParticipant: userParticipantWithUnread,
        newMessage: newMessage && normalizeMessage(newMessage),
      };
    } else if (options.chatId) {
      // Прямой вход по ID чата
      const chatId = options.chatId;

      const userParticipantBeforeJoin =
        await chatRepository.findUserParticipantInChat(userId, chatId);
      if (userParticipantBeforeJoin) {
        throw new BadRequestError("Пользователь уже в чате!");
      }

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

      return {
        chat: transformChat(
          fullChat,
          unreadCountsForChat,
          userParticipantWithUnread,
        ),
        newParticipant: userParticipantWithUnread,
      };
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

  const deleteChat = async (chatId: string, userId: string) => {
    const chat = await chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundError("Чат не найден");
    }

    const participant = await chatRepository.userInChat(chatId, userId);
    if (!participant) {
      throw new NotFoundError("Вы не являетесь участником чата");
    }

    if (participant.role !== "owner") {
      throw new BadRequestError("Только владелец может удалить чат");
    }

    await chatRepository.deleteChat(chatId);
  };

  const leaveFromChat = async (userId: string, chatId: string) => {
    const participant = await chatRepository.userInChat(chatId, userId);
    if (!participant) {
      throw new NotFoundError("Вы не являетесь участником чата");
    }

    if (participant.role === "owner") {
      throw new BadRequestError(
        "Владелец не может выйти из чата. Передайте владельца другому пользователю или удалите чат",
      );
    }

    await chatRepository.deleteParticipant(chatId, userId);
  };

  const transferOwnership = async (
    chatId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ) => {
    const chat = await chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundError("Чат не найден");
    }

    const participant = await chatRepository.userInChat(chatId, currentOwnerId);
    if (!participant) {
      throw new NotFoundError("Вы не являетесь участником чата");
    }

    if (participant.role !== "owner") {
      throw new BadRequestError("Только владелец может передать права");
    }

    const newParticipant = await chatRepository.userInChat(chatId, newOwnerId);
    if (!newParticipant) {
      throw new NotFoundError("Пользователь не является участником чата");
    }

    await chatRepository.transferOwnership(chatId, currentOwnerId, newOwnerId);
  };

  const kickUserFromChat = async (
    chatId: string,
    adminId: string,
    targetUserId: string,
  ) => {
    const chat = await chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundError("Чат не найден");
    }

    const adminParticipant = await chatRepository.userInChat(chatId, adminId);
    if (!adminParticipant) {
      throw new NotFoundError("Вы не являетесь участником чата");
    }

    if (adminParticipant.role === "member") {
      throw new BadRequestError(
        "Только администратор может исключать пользователей",
      );
    }

    if (adminId === targetUserId) {
      throw new BadRequestError("Вы не можете исключить себя из чата");
    }

    const targetParticipant = await chatRepository.userInChat(
      chatId,
      targetUserId,
    );
    if (!targetParticipant) {
      throw new NotFoundError("Пользователь не является участником чата");
    }

    // Используем явную проверку через переменную
    const targetRole = targetParticipant.role;

    if (targetRole === "owner") {
      throw new BadRequestError(
        "Нельзя исключить владельца чата. Сначала передайте права владельца.",
      );
    }

    if (adminParticipant.role === "moderator" && targetRole === "moderator") {
      throw new BadRequestError(
        "Модератор не может исключать других модераторов",
      );
    }

    await chatRepository.deleteParticipant(chatId, targetUserId);
  };

  return {
    create,
    joinChat,
    getAllUserChats,
    updateLastReadMessageTime,
    leaveFromChat,
    deleteChat,
    transferOwnership,
    kickUserFromChat,
  };
}
