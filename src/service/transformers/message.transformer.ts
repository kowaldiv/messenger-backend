import { PublicInviteLink } from "../../repositories/interfaces/invite-link.repository.interface.js";
import {
  Attachment,
  MessageUser,
  Message,
  ReplyTo,
  MessageReaction,
} from "../../repositories/interfaces/message.repository.interface.js";

// Определяем типы для каждого типа сообщения
export type TextMessage = {
  id: string;
  chatId: string | null;
  userId: string | null;
  text: string | null;
  type: "text";
  createdAt: Date;
  editedAt: Date;
  user: MessageUser | null;
  attachments: Attachment[];
  messageReactions: MessageReaction[];
  replyTo: ReplyTo | null;
};

interface JoinedMessageMetadata {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
}
export type JoinedMessage = {
  id: string;
  chatId: string | null;
  type: "joined";
  metadata: JoinedMessageMetadata;
  createdAt: Date;
};

export type InviteMessage = {
  id: string;
  chatId: string | null;
  userId: string | null;
  type: "invite";
  metadata: PublicInviteLink;
  createdAt: Date;
  user: MessageUser | null;
};

export type PublicMessage = TextMessage | JoinedMessage | InviteMessage;

// Функция для преобразования
export function normalizeMessage(message: Message): PublicMessage {
  switch (message.type) {
    case "text":
      return {
        id: message.id,
        chatId: message.chatId,
        userId: message.userId,
        text: message.text,
        type: "text",
        createdAt: message.createdAt,
        editedAt: message.editedAt,
        user: message.user,
        attachments: message.attachments,
        messageReactions: message.messageReactions,
        replyTo: message.replyTo,
      };

    case "joined":
      return {
        id: message.id,
        chatId: message.chatId,
        type: "joined",
        metadata: message.metadata as unknown as JoinedMessageMetadata,
        createdAt: message.createdAt,
      };

    case "invite":
      return {
        id: message.id,
        chatId: message.chatId,
        userId: message.userId,
        type: "invite",
        metadata: message.metadata as unknown as PublicInviteLink,
        createdAt: message.createdAt,
        user: message.user,
      };

    default:
      const _exhaustiveCheck: never = message.type;
      throw new Error(`Unknown message type: ${_exhaustiveCheck}`);
  }
}
