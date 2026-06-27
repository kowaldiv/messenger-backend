import { Prisma } from "../../../generated/prisma/browser.js";
import { avatarSelect } from "./user.selects.js";

// select пользователья в сообщениях
const messageUserSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatars: {
    where: { isPrimary: true },
    take: 1,
    select: avatarSelect,
  },
} satisfies Prisma.UserSelect;

const messageReactionsSelect = {
  id: true,
  messageId: true,
  userId: true,
  emoji: true,
} satisfies Prisma.MessageReactionSelect;

const attachmentsSelect = {
  id: true,
  fileName: true,
  fileType: true,
  fileUrl: true,
  messageId: true,
  createdAt: true,
} satisfies Prisma.AttachmenstSelect;

const replyToSelect = {
  id: true,
  chatId: true,
  userId: true,
  text: true,
  createdAt: true,
  editedAt: true,
  user: {
    select: messageUserSelect,
  },
} satisfies Prisma.MessageSelect;

// Базовый select для сообщений
export const messageSelect = {
  id: true,
  chatId: true,
  userId: true,
  type: true,
  text: true,
  metadata: true,
  createdAt: true,
  editedAt: true,
  user: {
    select: messageUserSelect,
  },
  messageReactions: {
    select: messageReactionsSelect,
  },
  attachments: {
    select: attachmentsSelect,
  },
  replyTo: {
    select: replyToSelect,
  },
} satisfies Prisma.MessageSelect;
