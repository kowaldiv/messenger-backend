import { Avatar } from "./avatar.repository.interface.js";

export interface MessageUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  avatars: Avatar[];
}

export interface Attachment {
  id: string;
  createdAt: Date;
  messageId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export interface MessageReaction {
  id: string;
  userId: string | null;
  messageId: string;
  emoji: string;
}

export interface ReplyTo {
  id: string;
  chatId: string | null;
  userId: string | null;
  text: string | null;
  createdAt: Date;
  editedAt: Date;
  user: MessageUser | null;
}
export interface Message {
  id: string;
  chatId: string | null;
  userId: string | null;
  text: string | null;
  type: "text" | "invite" | "joined";
  metadata: Record<string, unknown>;
  createdAt: Date;
  editedAt: Date;
  user: MessageUser | null;
  attachments: Attachment[];
  messageReactions: MessageReaction[];
  replyTo: ReplyTo | null;
}

export interface MessageRepository {
  create(params: {
    chatId: string;
    userId?: string;
    type: "text" | "invite" | "joined";
    text?: string;
    metadata?: any;
    replyToId?: string;
    attachments?: { fileUrl: string; fileType: string; fileName: string }[];
  }): Promise<Message>;
}