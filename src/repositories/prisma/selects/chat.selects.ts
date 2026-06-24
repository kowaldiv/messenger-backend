import { Prisma } from "../../../generated/prisma/browser.js";
import { messageSelect } from "./message.selects.js";
import { avatarSelect, publicUserSelect } from "./user.selects.js";

// Базовый select для участников чата
export const chatParticipantSelect = {
  role: true,
  lastReadMessageTime: true,
  user: {
    select: publicUserSelect,
  },
} satisfies Prisma.ChatParticipantsSelect;

// Базовый select для channel settings
export const channelSettingsSelect = {
  description: true,
  isPrivate: true,
} satisfies Prisma.ChannelSettingsSelect;

// Базовый select для чата (без title)
export const chatBaseSelect = {
  id: true,
  type: true,
  createdAt: true,
  messages: {
    where: {
      isDeleted: false,
    },
    select: messageSelect,
    orderBy: {
      createdAt: "desc" as const,
    },
  },
} satisfies Prisma.ChatsSelect;

// Select для чата с title
export const chatWithTitleSelect = {
  ...chatBaseSelect,
  title: true,
} satisfies Prisma.ChatsSelect;

// Select для чата с аватарами
export const chatWithAvatarsSelect = {
  ...chatWithTitleSelect,
  avatars: {
    select: avatarSelect,
    orderBy: {
      isPrimary: "desc" as const,
    },
  },
} satisfies Prisma.ChatsSelect;

// Полный select для разных типов чатов
export const chatSelects = {
  // Для приватного чата
  private: {
    ...chatBaseSelect,
    chatParticipants: {
      select: chatParticipantSelect,
    },
  } satisfies Prisma.ChatsSelect,

  // Для группового чата
  group: {
    ...chatBaseSelect,
    title: true,
    avatars: {
      select: avatarSelect,
      orderBy: {
        isPrimary: "desc" as const,
      },
    },
    chatParticipants: {
      select: chatParticipantSelect,
    },
  } satisfies Prisma.ChatsSelect,

  // Для канала
  channel: {
    ...chatBaseSelect,
    title: true,
    avatars: {
      select: avatarSelect,
      orderBy: {
        isPrimary: "desc" as const,
      },
    },
    channelSettings: {
      select: channelSettingsSelect,
    },
  } satisfies Prisma.ChatsSelect,
} as const;

// Для списка чатов (без сообщений)
export const chatListSelect = {
  id: true,
  type: true,
  title: true,
  createdAt: true,
  avatars: {
    where: { isPrimary: true },
    take: 1,
    select: avatarSelect,
  },
  chatParticipants: {
    select: {
      role: true,
      lastReadMessageTime: true,
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatars: {
            where: { isPrimary: true },
            take: 1,
            select: avatarSelect,
          },
        },
      },
    },
  },
} satisfies Prisma.ChatsSelect;