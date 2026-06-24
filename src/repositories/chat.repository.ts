import { FastifyInstance } from "fastify";
import {
  ChatParticipant,
  ChatRepository,
  ChatType,
  CreateChannelDto,
  CreateChatDto,
  CreateGroupChatDto,
  ParticipantRole,
  PublicChat,
} from "./interfaces/chat.repository.interface.js";
import {
  chatListSelect,
  chatParticipantSelect,
  chatSelects,
} from "./prisma/selects/chat.selects.js";

export function chatRepository(instance: FastifyInstance): ChatRepository {
  const prisma = instance.prisma;

  const create = async (data: CreateChatDto): Promise<PublicChat> => {
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

    const result = await prisma.chats.create({
      data: getData(data.type),
      select: chatSelects[data.type],
    });

    return result as unknown as PublicChat;
  };

  const addParticipant = async (
    chatId: string,
    userId: string,
    role: ParticipantRole,
  ) => {
    const participant = await prisma.chatParticipants.create({
      data: {
        chatId,
        userId,
        role,
      },
      select: chatParticipantSelect,
    });
    return {
      role: participant.role as ParticipantRole,
      lastReadMessageTime: participant.lastReadMessageTime,
      user: participant.user,
    };
  };

  const getChatParticipantsIds = async (chatId: string) => {
    const participants = await prisma.chatParticipants.findMany({
      where: { chatId },
      select: {
        userId: true,
      },
    });
    return participants.map((p) => p.userId);
  };

  // ------------- проверки ---------------

  const isChatExists = async (id: string): Promise<boolean> => {
    const chat = await prisma.chats.findUnique({
      where: { id },
    });
    return chat !== null;
  };

  const userInChat = async (userId: string, chatId: string) => {
    const participant = await prisma.chatParticipants.findFirst({
      where: {
        chatId,
        userId,
      },
      select: chatParticipantSelect,
    });
    if (!participant) {
      return null;
    }
    return {
      role: participant.role as ParticipantRole,
      lastReadMessageTime: participant.lastReadMessageTime,
      user: participant.user,
    } as ChatParticipant;
  };

  // ----------- найти чат --------------

  const findById = async (id: string) => {
    const chat = await prisma.chats.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
      },
    });
    if (!chat) return null;
    return {
      id: chat?.id,
      title: chat?.title,
      type: chat?.type as ChatType,
      createdAt: chat?.createdAt,
    } as PublicChat;
  };

  const findAllUserChats = async (userId: string) => {
    const chats = await prisma.chats.findMany({
      where: {
        chatParticipants: {
          some: {
            userId: userId,
          },
        },
      },
      select: chatListSelect,
    });
    return chats.map((chat) => ({
      ...chat,
      type: chat.type as ChatType,
    })) as PublicChat[];
  };

  const ensureUserIsChatOwner = async (userId: string, chatId: string) => {
    const participant = await prisma.chatParticipants.findFirst({
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
    ensureUserIsChatOwner,
  };
}
