import { Prisma } from "../../../generated/prisma/browser.js";

// Базовый select для аватаров
export const avatarSelect = {
  id: true,
  avatarUrl: true,
  isPrimary: true,
  createdAt: true,
} satisfies Prisma.AvatarSelect;

export const userSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  bio: true,
  lastSeen: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

// Базовый select для пользователей (публичные данные)
export const publicUserSelect = {
  ...userSelect,
  avatars: {
    select: avatarSelect,
    orderBy: {
      isPrimary: "desc" as const,
    },
  },
} satisfies Prisma.UserSelect;

export const publicUserWithOneAvatarSelect = {
  ...userSelect,
  avatars: {
    where: { isPrimary: true },
    take: 1,
    select: {
      id: true,
      avatarUrl: true,
      isPrimary: true,
      createdAt: true,
    },
  },
} satisfies Prisma.UserSelect;
