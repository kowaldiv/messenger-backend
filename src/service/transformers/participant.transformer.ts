import { ChatParticipant } from "../../repositories/interfaces/chat.repository.interface.js";

export interface PublicChatParticipant extends ChatParticipant {
  unread: number;
}

export function participantTransformer(
  partisipant: ChatParticipant,
  unread: number,
): PublicChatParticipant {
  return {
    ...partisipant,
    unread,
  };
}
