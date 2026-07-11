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

  const userInChat = async (chatId: string, userId: string) => {
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

  const findUserParticipantsInChats = async (
    userId: string,
    chatIds: string[],
  ): Promise<ChatParticipant[]> => {
    if (chatIds.length === 0) return [];
    const ChatParticipants = prisma.chatParticipant.findMany({
      where: {
        userId,
        chatId: { in: chatIds },
      },
      select: chatParticipantSelect, // ваш существующий select
    });
    return ChatParticipants as unknown as ChatParticipant[];
  };

  const findChatParticipants = async (
    chatId: string,
  ): Promise<ChatParticipant[]> => {
    const chatParticipants = await prisma.chatParticipant.findMany({
      where: {
        chatId,
      },
      select: chatParticipantSelect, // ваш существующий select
    });
    return chatParticipants as unknown as ChatParticipant[];
  };

  const findUserParticipantInChat = async (
    userId: string,
    chatId: string,
  ): Promise<ChatParticipant | null> => {
    return prisma.chatParticipant.findFirst({
      where: { userId, chatId },
      select: chatParticipantSelect, // ваш существующий select
    }) as unknown as ChatParticipant;
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

  const haveUsersPrivateChat = async (userId1: string, userId2: string) => {
    const chat = await prisma.chat.findFirst({
      where: {
        type: "private",
        chatParticipants: {
          some: { userId: userId1 },
        },
        AND: {
          chatParticipants: {
            some: { userId: userId2 },
          },
        },
      },
    });
    if (!chat) return null;
    return chat as unknown as Chat;
  };

  // ------- поиск --------------

  const findManyByPattern = async (
    userId: string,
    pattern: string,
    page: number = 1,
    limit: number = 5,
  ) => {
    const skip = (page - 1) * limit;

    const chats = await prisma.chat.findMany({
      where: {
        title: { contains: pattern, mode: "insensitive" },
      },
      select: getChatSelect(userId),
      skip,
      take: limit,
    });
    return chats as unknown as Chat[];
  };

  // ------------ updateLastReadMessageTime --------------

  const updateLastReadMessageTime = async (userId: string, chatId: string) => {
    await prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        lastReadMessageTime: new Date(), // 👈 текущее время
      },
    });
  };

  // --------------- Выход из чата и удаление чата -----------------

  const deleteChat = async (chatId: string) => {
    await prisma.chat.delete({
      where: { id: chatId },
    });
  };

  const deleteParticipant = async (chatId: string, userId: string) => {
    await prisma.chatParticipant.delete({
      where: {
        chatId_userId: { chatId, userId },
      },
    });
  };

  // ----------- назначения нового пользователя владельцем ------------------

  const transferOwnership = async (
    chatId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ) => {
    await prisma.$transaction([
      // Снимаем owner с текущего владельца и назначаем member
      prisma.chatParticipant.update({
        where: {
          chatId_userId: {
            chatId,
            userId: currentOwnerId,
          },
        },
        data: {
          role: "member",
        },
      }),
      // Назначаем нового владельца
      prisma.chatParticipant.update({
        where: {
          chatId_userId: {
            chatId,
            userId: newOwnerId,
          },
        },
        data: {
          role: "owner",
        },
      }),
    ]);
  };

  return {
    create,
    addParticipant,
    getChatParticipantsIds,
    isChatExists,
    userInChat,
    findById,
    findAllUserChats,
    findChatParticipants,
    findUserParticipantsInChats,
    findUserParticipantInChat,
    findFullChatById,
    ensureUserIsChatOwner,
    haveUsersPrivateChat,
    findManyByPattern,
    updateLastReadMessageTime,
    deleteChat,
    deleteParticipant,
    transferOwnership,
  };
}
