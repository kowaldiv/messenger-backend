import { FastifyInstance } from "fastify";
import {
  Chat,
  ChatInfo,
  ChatParticipant,
  ChatRepository,
  ChatType,
  CreateChannelDto,
  CreateChatDto,
  CreateGroupChatDto,
  ParticipantRole,
} from "./interfaces/chat.repository.interface.js";
import {
  chatInfoSelect,
  chatParticipantSelect,
  getChatSelect,
} from "./prisma/selects/chat.selects.js";

export function chatRepository(instance: FastifyInstance): ChatRepository {
  const prisma = instance.prisma;

  const create = async (data: CreateChatDto, userId: string) => {
    const getData = (type: ChatType) => {
      switch (type) {
        case "channel": {
          const channelData = data as CreateChannelDto;
          return {
            type: channelData.type,
            title: channelData.title,
            channelSettings: {
              create: {
                description: channelData.description,
                isPrivate: channelData.isPrivate,
              },
            },
          };
        }
        case "group": {
          const groupData = data as CreateGroupChatDto;
          return {
            type: groupData.type,
            title: groupData.title,
          };
        }
        case "private": {
          return {
            type: data.type,
            title: null,
          };
        }
      }
    };

    const result = await prisma.chat.create({
      data: getData(data.type),
      select: getChatSelect(userId),
    });

    return result as unknown as Chat;
  };

  const addParticipant = async (
    chatId: string,
    userId: string,
    role: ParticipantRole,
  ) => {
    const participant = await prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
        role,
      },
      select: chatParticipantSelect,
    });
    return participant as ChatParticipant;
  };

  const getChatParticipantsIds = async (chatId: string) => {
    const participants = await prisma.chatParticipant.findMany({
      where: { chatId },
      select: {
        userId: true,
      },
    });
    return participants.map((p) => p.userId);
  };

  // ------------- проверки ---------------

  const isChatExists = async (id: string): Promise<boolean> => {
    const chat = await prisma.chat.findUnique({
      where: { id },
    });
    return chat !== null;
  };

  const userInChat = async (userId: string, chatId: string) => {
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId,
      },
      select: chatParticipantSelect,
    });
    if (!participant) {
      return null;
    }
    return participant as ChatParticipant;
  };

  // ----------- найти чат --------------

  const findById = async (id: string) => {
    const chat = await prisma.chat.findUnique({
      where: {
        id,
      },
      select: chatInfoSelect,
    });
    if (!chat) return null;
    return chat as ChatInfo;
  };

  const findAllUserChats = async (userId: string) => {
    const chats = await prisma.chat.findMany({
      where: {
        chatParticipants: {
          some: {
            userId: userId,
          },
        },
      },
      select: getChatSelect(userId),
    });
    return chats as unknown as Chat[];
  };

  const findFullChatById = async (chatId: string, userId: string) => {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: getChatSelect(userId),
    });
    if (!chat) return null;
    return chat as unknown as Chat;
  };

  const ensureUserIsChatOwner = async (userId: string, chatId: string) => {
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId,
      },
    });
    if (participant && participant.role === "owner") {
      return true;
    } else {
      return false;
    }
  };

  return {
    create,
    addParticipant,
    getChatParticipantsIds,
    isChatExists,
    userInChat,
    findById,
    findAllUserChats,
    findFullChatById,
    ensureUserIsChatOwner,
  };
}
