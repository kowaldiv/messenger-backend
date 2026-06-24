import { Prisma } from "../../../generated/prisma/browser.js";
import { avatarSelect } from "./user.selects.js";

// Базовый select для сообщений
export const messageSelect = {
  id: true,
  chatId: true,
  userId: true,
  text: true,
  replyToId: true,
  createdAt: true,
  editedAt: true,
  attachments: {
    select: {
      id: true,
      messageId: true,
      fileUrl: true,
      fileType: true,
      fileName: true,
    },
  },
  messageReactions: {
    select: {
      id: true,
      messageId: true,
      userId: true,
      emoji: true,
    },
  },
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
} satisfies Prisma.MessagesSelect;