import { NotFoundError } from "../errors/index.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import {
  ChatService,
  CreateChatWithCreator,
  PublicChatWithParticipants,
} from "./interfaces/chat.service.interface.js";

export function chatService(
  chatRepository: ChatRepository,
  userRepository: UserRepository,
): ChatService {
  const create = async (
    data: CreateChatWithCreator,
  ): Promise<PublicChatWithParticipants> => {
    const isUserExist = await userRepository.existsById(data.creatorId);
    if (!isUserExist) {
      throw new NotFoundError("USER_NOT_FOUND");
    }

    if (data.type === "channel") {
      const chat = await chatRepository.create({
        type: data.type,
        title: data.title,
        description: data.description,
        isPrivate: data.isPrivate,
      });

      return {
        ...chat,
      } as unknown as PublicChatWithParticipants;
    } else {
      const chat = await chatRepository.create({
        type: data.type,
        title: data.title,
      });

      const participant = await chatRepository.addParticipant(
        chat.id,
        data.creatorId,
        "owner",
      );

      return {
        ...chat,
        chatParticipants: [participant],
      } as unknown as PublicChatWithParticipants;
    }
  };

  const addParticipant = async (chatId: string, userId: string) => {
    const isUserExist = await userRepository.existsById(userId);
    if (!isUserExist) {
      throw new NotFoundError("USER_NOT_FOUND");
    }
    const isChatxist = await chatRepository.isChatExists(chatId);
    if (!isChatxist) {
      throw new NotFoundError("CHAT_NOT_FOUND");
    }

    await chatRepository.addParticipant(chatId, userId, "member");

    return;
  };

  const getChatParticipantsIds = async (chatId: string) => {
    const isChatxist = await chatRepository.isChatExists(chatId);
    if (!isChatxist) {
      throw new NotFoundError("CHAT_NOT_FOUND");
    }

    const participants = await chatRepository.getChatParticipantsIds(chatId);

    return participants;
  };

  const getAllUserChats = async (userId: string) => {
    const isUserExist = await userRepository.existsById(userId);
    if (!isUserExist) {
      throw new NotFoundError("USER_NOT_FOUND");
    }
    const chats = await chatRepository.findAllUserChats(userId);
    return chats;
  };

  return {
    create,
    addParticipant,
    getChatParticipantsIds,
    getAllUserChats,
  };
}
