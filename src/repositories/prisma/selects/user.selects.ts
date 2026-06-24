import { Prisma } from "../../../generated/prisma/browser.js";

// Базовый select для аватаров
export const avatarSelect = {
  id: true,
  avatarUrl: true,
  isPrimary: true,
  createdAt: true,
} satisfies Prisma.AvatarsSelect;

// Базовый select для пользователей (публичные данные)
export const publicUserSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  bio: true,
  lastSeen: true,
  createdAt: true,
  avatars: {
    select: avatarSelect,
    orderBy: {
      isPrimary: "desc" as const,
    },
  },
} satisfies Prisma.UsersSelect;