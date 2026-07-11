import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import { UnreadRepository } from "../repositories/interfaces/unread.repository.interface.js";
import { SearchService } from "./interfaces/channel.setvice.interface.js";
import { transformChat } from "./transformers/chat.transformer.js";
import { participantTransformer } from "./transformers/participant.transformer.js";

export function searchService(
  userRepository: UserRepository,
  chatRepository: ChatRepository,
  unreadRepository: UnreadRepository,
): SearchService {
  const search = async (userId: string, pattern: string) => {
    const users = await userRepository.findManyByPattern(userId, pattern);
    const chats = await chatRepository.findManyByPattern(userId, pattern);

    if (chats.length === 0) {
      return { users, chats: [] };
    }

    const chatIds = chats.map((c) => c.id);

    // Получаем участников пользователя во всех чатах
    const userParticipants = await chatRepository.findUserParticipantsInChats(
      userId,
      chatIds,
    );

    // Создаём Map для быстрого доступа
    const participantMap = new Map(userParticipants.map((p) => [p.chatId, p]));

    // Получаем количество непрочитанных для всех чатов одним запросом
    const unreadCountsForChats =
      await unreadRepository.getUnreadCountsForChats(chatIds);

    const unreadMap = new Map(
      unreadCountsForChats.map((item) => [
        item.chatId,
        item.participantsUnread,
      ]),
    );

    // Трансформируем все чаты
    const transformedChats = chats.map((chat) => {
      const myParticipant = participantMap.get(chat.id);
      const participantsUnread = unreadMap.get(chat.id) || [];

      if (myParticipant) {
        const myUnread = participantsUnread.find((p) => p.userId === userId);
        const myUnreadCount = myUnread ? Number(myUnread.unread) : 0;

        const userParticipantWithUnread = participantTransformer(
          myParticipant,
          myUnreadCount,
        );

        return transformChat(
          chat,
          participantsUnread,
          userParticipantWithUnread,
        );
      }

      // Пользователя нет в чате — возвращаем чат без myParticipant
      return transformChat(chat, participantsUnread);
    });

    return {
      users,
      chats: transformedChats,
    };
  };

  return {
    search,
  };
}
