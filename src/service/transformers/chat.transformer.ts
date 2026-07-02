import { Avatar } from "../../repositories/interfaces/avatar.repository.interface.js";
import {
  Chat,
  ChatParticipant,
  ChatType,
} from "../../repositories/interfaces/chat.repository.interface.js";
import { normalizeMessage, PublicMessage } from "./message.transformer.js";

export type PublicChat = {
  id: string;
  type: ChatType;
  createdAt: Date;
  messages: PublicMessage[];
} & (
  | { type: "private"; chatParticipant: ChatParticipant }
  | {
      type: "group";
      title: string;
      avatars: Avatar[];
      chatParticipants: ChatParticipant[];
    }
  | {
      type: "channel";
      title: string;
      avatars: Avatar[];
      channelSettings: { description: string | null; isPrivate: boolean };
    }
);

export function transformChat(chat: Chat): PublicChat {
  const base = {
    id: chat.id,
    type: chat.type,
    createdAt: chat.createdAt,
    messages: chat.messages.map((message) => normalizeMessage(message)),
  };

  switch (chat.type) {
    case "private": {
      return {
        ...base,
        type: "private" as const,
        chatParticipant: chat.chatParticipants[0],
      };
    }

    case "group": {
      return {
        ...base,
        type: "group" as const,
        title: chat.title,
        avatars: chat.avatars,
        chatParticipants: chat.chatParticipants,
      };
    }

    case "channel": {
      return {
        ...base,
        type: "channel" as const,
        title: chat.title,
        avatars: chat.avatars,
        channelSettings: chat.channelSettings,
      };
    }

    default:
      throw new Error(`Unknown chat type: ${(chat as any).type}`);
  }
}
