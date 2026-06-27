import { Avatar } from "../../repositories/interfaces/avatar.repository.interface.js";
import {
  Chat,
  ChatParticipant,
  ChatType,
} from "../../repositories/interfaces/chat.repository.interface.js";

export type PublicChat = {
  id: string;
  type: ChatType;
  title: string | null;
  createdAt: Date;
} & (
  | { type: "private"; chatParticipant: ChatParticipant }
  | {
      type: "group";
      avatars: Avatar[];
      chatParticipants: ChatParticipant[];
    }
  | {
      type: "channel";
      avatars: Avatar[];
      channelSettings: { description: string | null; isPrivate: boolean };
    }
);

export function transformChat(
  chat: Chat,
): PublicChat {
  const base = {
    id: chat.id,
    type: chat.type,
    title: chat.title,
    createdAt: chat.createdAt,
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
        avatars: chat.avatars,
        chatParticipants: chat.chatParticipants,
      };
    }

    case "channel": {
      return {
        ...base,
        type: "channel" as const,
        avatars: chat.avatars,
        channelSettings: chat.channelSettings,
      };
    }

    default:
      throw new Error(`Unknown chat type: ${(chat as any).type}`);
  }
}
