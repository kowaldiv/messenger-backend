import { FastifyInstance } from "fastify";
import { UnreadRepository } from "./interfaces/unread.repository.interface.js";

export function unreadRepository(instance: FastifyInstance): UnreadRepository {
  const prisma = instance.prisma;

  const getUnreadCount = async (userId: string, chatId: string) => {
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
      select: {
        lastReadMessageTime: true,
      },
    });

    if (!participant) return 0;

    const result = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM messages m
      WHERE m.chat_id = ${chatId}
        AND m.is_deleted = false
        AND m.user_id != ${userId}
        AND m.created_at > ${participant.lastReadMessageTime}
    `;

    return Number(result[0]?.count ?? 0);
  };

  const getUnreadCounts = async (userId: string, chatIds: string[]) => {
    if (chatIds.length === 0) return [];

    const result = await prisma.$queryRaw<{ chat_id: string; count: bigint }[]>`
    SELECT 
      m.chat_id,
      COUNT(*) as count
    FROM messages m
    WHERE m.chat_id = ANY(${chatIds})
      AND m.is_deleted = false
      AND m.user_id != ${userId}
      AND m.created_at > (
        SELECT cp.last_read_message_time 
        FROM chat_participants cp 
        WHERE cp.chat_id = m.chat_id 
          AND cp.user_id = ${userId}
      )
    GROUP BY m.chat_id
  `;

    // Создаем Map для быстрого поиска по chat_id
    const countsMap = new Map<string, number>();
    for (const row of result) {
      countsMap.set(row.chat_id, Number(row.count));
    }

    // Возвращаем массив в том же порядке, что и входные chatIds
    return chatIds.map((chatId) => ({
      chatId,
      unreadCount: countsMap.get(chatId) || 0,
    }));
  };

  const getUnreadCountsForChat = async (chatId: string) => {
    // Проверяем тип чата
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { type: true },
    });

    // Если это channel, возвращаем пустой массив
    if (!chat || chat.type === "channel") {
      return [];
    }

    const result = await prisma.$queryRaw<
      { user_id: string; unread: bigint }[]
    >`
    SELECT 
      cp.user_id,
      COUNT(m.id) as unread
    FROM chat_participants cp
    LEFT JOIN messages m ON m.chat_id = cp.chat_id
      AND m.user_id != cp.user_id
      AND m.is_deleted = false
      AND m.created_at > cp.last_read_message_time
    WHERE cp.chat_id = ${chatId}
    GROUP BY cp.user_id
  `;

    return result.map((row) => ({
      userId: row.user_id,
      unread: row.unread.toString(),
    }));
  };

  const getUnreadCountsForChats = async (chatIds: string[]) => {
    if (chatIds.length === 0) return [];

    // Получаем типы всех чатов
    const chats = await prisma.chat.findMany({
      where: { id: { in: chatIds } },
      select: { id: true, type: true },
    });

    // Создаём Map типов чатов
    const chatTypes = new Map(chats.map((c) => [c.id, c.type]));

    // Фильтруем только не-channel чаты для SQL запроса
    const nonChannelChatIds = chatIds.filter(
      (id) => chatTypes.get(id) !== "channel",
    );

    // Получаем непрочитанные только для не-channel чатов
    const result =
      nonChannelChatIds.length > 0
        ? await prisma.$queryRaw<
            { chat_id: string; user_id: string; unread: bigint }[]
          >`
      SELECT 
        cp.chat_id,
        cp.user_id,
        COUNT(m.id) as unread
      FROM chat_participants cp
      LEFT JOIN messages m ON m.chat_id = cp.chat_id
        AND m.user_id != cp.user_id
        AND m.is_deleted = false
        AND m.created_at > cp.last_read_message_time
      WHERE cp.chat_id = ANY(${nonChannelChatIds})
      GROUP BY cp.chat_id, cp.user_id
    `
        : [];

    // Группируем по chatId
    const grouped = new Map<string, { userId: string; unread: string }[]>();

    // Инициализируем все chatIds пустыми массивами
    for (const chatId of chatIds) {
      grouped.set(chatId, []);
    }

    // Заполняем данными из результата (только для не-channel чатов)
    for (const row of result) {
      const participants = grouped.get(row.chat_id) || [];
      participants.push({
        userId: row.user_id,
        unread: row.unread.toString(),
      });
      grouped.set(row.chat_id, participants);
    }

    // Возвращаем массив в том же порядке, что и входные chatIds
    return chatIds.map((chatId) => ({
      chatId,
      participantsUnread: grouped.get(chatId) || [],
    }));
  };
  return {
    getUnreadCount,
    getUnreadCounts,
    getUnreadCountsForChat,
    getUnreadCountsForChats,
  };
}
