export interface Message {
  id: string;
  chatId: string | null;
  userId: string | null;
  text: string | null;
  replyToId: string | null;
  createdAt: Date;
  editedAt: Date;
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
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
  } | null;
}

export interface PublicMessage extends Message {
  attachments: Attachment[];
  messageReactions: MessageReaction[];
}

export interface MessageRepository {
  create(
    userId: string,
    chatId: string,
    text: string,
    replyToId?: string,
    attachments?: {
      fileUrl: string;
      fileType: string;
      fileName: string;
    }[],
  ): Promise<PublicMessage>;
}
