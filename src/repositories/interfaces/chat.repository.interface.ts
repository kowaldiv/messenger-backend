import { Avatar } from "./avatar.repository.interface.js";
import { PublicUserWithAvatars } from "./userQuery.repository.interface.js";

export type ChatType = "private" | "group" | "channel";
export interface Chat {
  id: string;
  title: string;
  type: ChatType;
  createdAt: Date;
}

export type ParticipantRole = "member" | "moderator" | "owner";
export interface ChatParticipant {
  role: ParticipantRole;
  lastReadMessageTime: Date;
  user: PublicUserWithAvatars;
}

export interface CreatePrivateChatDto {
  type: "private";
}
export interface CreateGroupChatDto {
  type: "group";
  title: string;
}
export interface CreateChannelDto {
  type: "channel";
  title: string;
  description?: string;
  isPrivate: boolean;
}

export type PublicChat = {
  id: string;
  type: ChatType;
  title: string | null;
  createdAt: Date;
} & (
  | { type: "private" }
  | { type: "group"; avatars: Avatar[]; chatParticipants: ChatParticipant[] }
  | {
      type: "channel";
      avatars: Avatar[];
      channelSettings: { description: string | null; isPrivate: boolean };
    }
);

export type CreateChatDto =
  | CreatePrivateChatDto
  | CreateGroupChatDto
  | CreateChannelDto;

export interface ChatRepository {
  create: (data: CreateChatDto) => Promise<PublicChat>;
  addParticipant: (
    chatId: string,
    userId: string,
    role: ParticipantRole,
  ) => Promise<ChatParticipant>;
  getChatParticipantsIds: (chatId: string) => Promise<string[]>;
  isChatExists(id: string): Promise<boolean>;
  userInChat(userId: string, chatId: string): Promise<ChatParticipant | null>;
  findById(id: string): Promise<PublicChat | null>
  findAllUserChats(userId: string): Promise<PublicChat[]>
  ensureUserIsChatOwner(userId: string, chatId: string): Promise<boolean>;
}
