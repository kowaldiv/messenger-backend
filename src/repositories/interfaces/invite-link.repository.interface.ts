import { Avatar } from "./avatar.repository.interface.js";

interface InviteLinkChatInfo {
  id: string;
  title: string;
  avatars: Avatar[];
}

export interface PublicInviteLink {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  chat: InviteLinkChatInfo;
}

export interface InviteLinkRepository {
  create: (
    token: string,
    expiresAt: Date,
    chatId: string,
  ) => Promise<PublicInviteLink>;
  findBytoken: (token: string) => Promise<PublicInviteLink | null>;
  remove: (id: string) => Promise<void>;
}
