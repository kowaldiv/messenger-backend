import type {
  ChatParticipant,
  PublicChat,
} from "../../repositories/interfaces/chat.repository.interface.js";

export type CreateChatDto =
  | { type: "channel"; title: string; description?: string; isPrivate: boolean }
  | { type: "group"; title: string };

export type CreateChatWithCreator = CreateChatDto & {
  creatorId: string;
};

export type PublicChatWithParticipants = PublicChat & {
  chatParticipants: ChatParticipant[];
};

export interface ChatService {
  create: (data: CreateChatWithCreator) => Promise<PublicChatWithParticipants>;
  addParticipant(chatId: string, userId: string): Promise<void>;
  getChatParticipantsIds(chatId: string): Promise<string[]>;
  getAllUserChats(userId: string): Promise<PublicChat[]>;
}
