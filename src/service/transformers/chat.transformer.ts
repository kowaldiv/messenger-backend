import { Avatar } from "../../repositories/interfaces/avatar.repository.interface.js";
import {
  Chat,
  ChatType,
} from "../../repositories/interfaces/chat.repository.interface.js";
import { normalizeMessage, PublicMessage } from "./message.transformer.js";
import { participantTransformer, PublicChatParticipant } from "./participant.transformer.js";

export type PublicChat = {
  id: string;
  type: ChatType;
  createdAt: Date;
  messages: PublicMessage[];
  myParticipant?: PublicChatParticipant;
} & (
  | { type: "private"; chatParticipant: PublicChatParticipant }
  | {
      type: "group";
      title: string;
      avatars: Avatar[];
      chatParticipants: PublicChatParticipant[];
    }
  | {
      type: "channel";
      title: string;
      avatars: Avatar[];
      channelSettings: { description: string | null; isPrivate: boolean };
    }
);

export function transformChat(
  chat: Chat,
  unreadCountsForChat: {
    userId: string;
    unread: string;
  }[],
  myParticipant?: PublicChatParticipant,
): PublicChat {
  const getUnreadForUser = (userId: string): number => {
    const found = unreadCountsForChat.find((item) => item.userId === userId);
    return found ? Number(found.unread) : 0;
  };

  const base = {
    id: chat.id,
    type: chat.type,
    createdAt: chat.createdAt,
    messages: chat.messages.map((message) => normalizeMessage(message)),
    myParticipant: myParticipant,
  };

  switch (chat.type) {
    case "private": {
      const participant = chat.chatParticipants[0];
      const unread = getUnreadForUser(participant.user.id);
      const transformedParticipant = participantTransformer(
        participant,
        unread,
      );

      return {
        ...base,
        type: "private" as const,
        chatParticipant: transformedParticipant,
      };
    }

    case "group": {
      const transformedParticipants = chat.chatParticipants.map(
        (participant) => {
          const unread = getUnreadForUser(participant.user.id);
          return participantTransformer(participant, unread);
        },
      );

      return {
        ...base,
        type: "group" as const,
        title: chat.title,
        avatars: chat.avatars,
        chatParticipants: transformedParticipants,
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
