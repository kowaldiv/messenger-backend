import { Avatar } from "./avatar.repository.interface.js";
import { Message } from "./message.repository.interface.js";
import { PublicUser } from "./userQuery.repository.interface.js";

export type ChatType = "private" | "group" | "channel";

export type ParticipantRole = "member" | "moderator" | "owner";
export interface ChatParticipant {
  chatId: string;
  role: ParticipantRole;
  lastReadMessageTime: Date;
  user: PublicUser;
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

export interface ChatInfo {
  id: string;
  type: ChatType;
  createdAt: Date;
}

export interface Chat extends ChatInfo {
  title: string;
  messages: Message[];
  avatars: Avatar[];
  channelSettings: { description: string | null; isPrivate: boolean };
  chatParticipants: ChatParticipant[];
}

export type CreateChatDto =
  | CreatePrivateChatDto
  | CreateGroupChatDto
  | CreateChannelDto;

export interface ChatRepository {
  create: (data: CreateChatDto, userId: string) => Promise<Chat>;
  addParticipant: (
    chatId: string,
    userId: string,
    role: ParticipantRole,
  ) => Promise<ChatParticipant>;
  getChatParticipantsIds: (chatId: string) => Promise<string[]>;
  isChatExists(id: string): Promise<boolean>;
  userInChat(userId: string, chatId: string): Promise<ChatParticipant | null>;
  findById(id: string): Promise<ChatInfo | null>;
  findAllUserChats(userId: string): Promise<Chat[]>;
  findFullChatById(chatId: string, userId: string): Promise<Chat | null>;
  ensureUserIsChatOwner(userId: string, chatId: string): Promise<boolean>;
}

// export type PublicChat = {
//   id: string;
//   type: ChatType;
//   title: string | null;
//   createdAt: Date;
// } & (
//   | { type: "private"; chatParticipants: ChatParticipant[] }
//   | { type: "group"; avatars: Avatar[]; chatParticipants: ChatParticipant[] }
//   | {
//       type: "channel";
//       avatars: Avatar[];
//       channelSettings: { description: string | null; isPrivate: boolean };
//       chatParticipants: ChatParticipant[];
//     }
// );
