import { PublicUser } from "../../repositories/interfaces/userQuery.repository.interface.js";
import { PublicChat } from "../transformers/chat.transformer.js";

export interface SearchService {
  search(
    userId: string,
    pattern: string,
  ): Promise<{ users: PublicUser[]; chats: PublicChat[] }>;
}
