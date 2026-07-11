import { Prisma } from "../../../generated/prisma/browser.js";
import { avatarSelect } from "./user.selects.js";

export const PublicInviteLinkSelect = {
  id: true,
  createdAt: true,
  token: true,
  expiresAt: true,
  chat: {
    select: {
      id: true,
      title: true,
      avatars: {
        select: avatarSelect,
        orderBy: { isPrimary: "desc" as const },
        take: 1,
      },
    },
  },
} satisfies Prisma.InviteLinkSelect;
