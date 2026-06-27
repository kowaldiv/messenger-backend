import { Prisma } from "../../../generated/prisma/browser.js";
import { chatInfoSelect } from "./chat.selects.js";
import { avatarSelect } from "./user.selects.js";

export const PublicInviteLinkSelect = {
  id: true,
  createdAt: true,
  token: true,
  expiresAt: true,
  chat: {
    select: {
      ...chatInfoSelect,
      title: true,
      avatars: {
        select: avatarSelect,
        orderBy: { isPrimary: "desc" as const },
        take: 1,
      },
    },
  },
} satisfies Prisma.InviteLinkSelect;
