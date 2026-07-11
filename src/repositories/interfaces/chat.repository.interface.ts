import { Avatar } from "./avatar.repository.interface.js";
import { Message } from "./message.repository.interface.js";
import { PublicUser } from "./userQuery.repository.interface.js";

export type ChatType = "private" | "group" | "channel";

export type ParticipantRole = "member" | "moderator" | "owner";
export interface ChatParticipant {
  chatId: string;
  role: ParticipantRole;
  lastReadMessageTime: Date;
  joinedAt: Date;
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
  type: "private" | "group" | "channel";
  createdAt: Date;
}

interface PrivateChat {
  id: string;
  createdAt: Date;
  type: "private";
  messages: Message[];
  chatParticipants: ChatParticipant[];
}

interface GroupChat {
  id: string;
  createdAt: Date;
  type: "group";
  title: string;
  messages: Message[];
  avatars: Avatar[];
  chatParticipants: ChatParticipant[];
}

interface ChannelChat {
  id: string;
  createdAt: Date;
  type: "channel";
  title: string;
  messages: Message[];
  avatars: Avatar[];
  channelSettings: { description: string | null; isPrivate: boolean };
}

export type Chat = PrivateChat | GroupChat | ChannelChat;

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
  userInChat(chatId: string, userId: string): Promise<ChatParticipant | null>;
  findById(id: string): Promise<ChatInfo | null>;
  findAllUserChats(userId: string): Promise<Chat[]>;
  findChatParticipants(chatId: string): Promise<ChatParticipant[]>;
  findUserParticipantsInChats(
    userId: string,
    chatIds: string[],
  ): Promise<ChatParticipant[]>;
  findUserParticipantInChat(
    userId: string,
    chatId: string,
  ): Promise<ChatParticipant | null>;
  findFullChatById(chatId: string, userId: string): Promise<Chat | null>;
  ensureUserIsChatOwner(userId: string, chatId: string): Promise<boolean>;
  haveUsersPrivateChat(userId1: string, userId2: string): Promise<Chat | null>;
  findManyByPattern(
    userId: string,
    pattern: string,
    page?: number,
    limit?: number,
  ): Promise<Chat[]>;
  updateLastReadMessageTime(userId: string, chatId: string): Promise<void>;
  deleteChat(chatId: string): Promise<void>;
  deleteParticipant(chatId: string, userId: string): Promise<void>;
  transferOwnership: (chatId: string,
    currentOwnerId: string,
    newOwnerId: string,) => Promise<void>
}
