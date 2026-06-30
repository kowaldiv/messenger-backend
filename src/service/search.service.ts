import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import { SearchService } from "./interfaces/channel.setvice.interface.js";
import { transformChat } from "./transformers/chat.transformer.js";

export function searchService(
  userRepository: UserRepository,
  chatRepository: ChatRepository,
): SearchService {
  const search = async (userId: string, pattern: string) => {
    const users = await userRepository.findManyByPattern(pattern);
    const chats = await chatRepository.findManyByPattern(userId, pattern);
    return { users, chats: chats.map((chat) => transformChat(chat)) };
  };

  return {
    search,
  };
}
