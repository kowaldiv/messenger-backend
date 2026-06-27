import { Prisma } from "../../../generated/prisma/browser.js";
import { messageSelect } from "./message.selects.js";
import { avatarSelect, publicUserSelect } from "./user.selects.js";

// Базовый select для участников чата
export const chatParticipantSelect = {
  chatId: true,
  role: true,
  lastReadMessageTime: true,
  user: {
    select: publicUserSelect,
  },
} satisfies Prisma.ChatParticipantSelect;

// Базовый select для channel settings
export const channelSettingsSelect = {
  description: true,
  isPrivate: true,
} satisfies Prisma.ChannelSettingSelect;

export const chatInfoSelect = {
  id: true,
  type: true,
  createdAt: true,
} satisfies Prisma.ChatSelect;

// Базовый select для чата (без title)
export const chatBaseSelect = {
  ...chatInfoSelect,
  messages: {
    where: {
      isDeleted: false,
    },
    select: messageSelect,
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 1,
  },
} satisfies Prisma.ChatSelect;

// chat.selects.ts
export function getChatSelect(userId: string) {
  return {
    ...chatBaseSelect,
    title: true,
    messages: {
      where: { isDeleted: false },
      select: messageSelect,
      orderBy: { createdAt: "desc" as const },
      take: 1,
    },
    avatars: {
      select: avatarSelect,
      orderBy: { isPrimary: "desc" as const },
      take: 1,
    },
    channelSettings: {
      select: channelSettingsSelect,
    },
    // Всего ОДИН участник (не я) для private чатов, чтоб было какую аватарку и firstName и lastName отображать
    chatParticipants: {
      where: {
        userId: { not: userId },
      },
      select: chatParticipantSelect,
      take: 1,
    },
  } satisfies Prisma.ChatSelect;
}

// Функция для создания селекта с фильтрацией по userId
// export function getChatSelects(userId: string) {
//   return {
//     // Для приватного чата
//     private: {
//       ...chatBaseSelect,
//       chatParticipants: {
//         where: {
//           userId: { not: userId },
//         },
//         select: {
//           userId: true,
//           role: true,
//           lastReadMessageTime: true,
//           user: {
//             select: publicUserSelect,
//           },
//         },
//         take: 1,
//       },
//     } satisfies Prisma.ChatSelect,

//     // Для группового чата
//     group: {
//       ...chatBaseSelect,
//       title: true,
//       avatars: {
//         select: avatarSelect,
//         orderBy: {
//           isPrimary: "desc" as const,
//         },
//         take: 1,
//       },
//       chatParticipants: {
//         where: {
//           userId: {
//             not: userId,
//           },
//         },
//         select: chatParticipantSelect,
//       },
//     } satisfies Prisma.ChatSelect,

//     // Для канала
//     channel: {
//       ...chatBaseSelect,
//       title: true,
//       avatars: {
//         select: avatarSelect,
//         orderBy: {
//           isPrimary: "desc" as const,
//         },
//       },
//       channelSettings: {
//         select: channelSettingsSelect,
//       },
//       chatParticipants: {
//         where: {
//           userId: userId,
//         },
//         select: chatParticipantSelect,
//         take: 1,
//       },

//       // Для канала тоже можно добавить chatParticipants
//     } satisfies Prisma.ChatSelect,
//   } as const;
// }
