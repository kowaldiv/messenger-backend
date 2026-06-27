import { BadRequestError, NotFoundError } from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { InviteLinkRepository } from "../repositories/interfaces/invite-link.repository.interface.js";
import { MessageRepository } from "../repositories/interfaces/message.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import {
  ChatService,
  CreateChatWithCreator,
} from "./interfaces/chat.service.interface.js";
import { transformChat } from "./transformers/chat.transformer.js";

export function chatService(
  chatRepository: ChatRepository,
  userRepository: UserRepository,
  inviteLinkRepository: InviteLinkRepository,
  messageRepository: MessageRepository,
): ChatService {
  const create = async (data: CreateChatWithCreator) => {
    const isUserExist = await userRepository.existsById(data.creatorId);
    if (!isUserExist) {
      throw new NotFoundError("USER_NOT_FOUND");
    }

    if (data.type === "channel") {
      const chat = await chatRepository.create(
        {
          type: data.type,
          title: data.title,
          description: data.description,
          isPrivate: data.isPrivate,
        },
        data.creatorId,
      );

      return transformChat(chat);
    } else {
      const chat = await chatRepository.create(
        {
          type: data.type,
          title: data.title,
        },
        data.creatorId,
      );

      await chatRepository.addParticipant(chat.id, data.creatorId, "owner");

      return transformChat(chat);
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

      const chatInfo = await chatRepository.findById(chatId);
      if (!chatInfo) throw new NotFoundError("CHAT_NOT_FOUND");
      if (!(chatInfo.type === "group"))
        throw new BadRequestError("YOU_CAN_JOIN_ONLY_IN_GROUP");

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

      const fullChat = await chatRepository.findFullChatById(chatId, userId);
      if (!fullChat) throw new NotFoundError("CHAT_NOT_FOUND_AFTER_JOIN");
      return transformChat(fullChat);
    } else if (options.chatId) {
      // Прямой вход по ID чата
      const chatId = options.chatId;
      const chatInfo = await chatRepository.findById(chatId);
      if (!chatInfo) throw new NotFoundError("CHAT_NOT_FOUND");
      if (!(chatInfo.type === "channel"))
        throw new BadRequestError("YOU_NEED_A_TOKEN");

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

      const fullChat = await chatRepository.findFullChatById(chatId, userId);
      if (!fullChat) throw new NotFoundError("CHAT_NOT_FOUND_AFTER_JOIN");
      return transformChat(fullChat);
    } else {
      throw new BadRequestError("EITHER_INVITE_LINK_OR_CHAT_ID_REQUIRED");
    }
  };

  const getChatParticipantsIds = async (chatId: string) => {
    const isChatxist = await chatRepository.isChatExists(chatId);
    if (!isChatxist) throw new NotFoundError("CHAT_NOT_FOUND");

    const participants = await chatRepository.getChatParticipantsIds(chatId);

    return participants;
  };

  const getAllUserChats = async (userId: string) => {
    const isUserExist = await userRepository.existsById(userId);
    if (!isUserExist) throw new NotFoundError("USER_NOT_FOUND");
    const chats = await chatRepository.findAllUserChats(userId);
    return chats.map((chat) => transformChat(chat));
  };

  return {
    create,
    joinChat,
    getChatParticipantsIds,
    getAllUserChats,
  };
}
