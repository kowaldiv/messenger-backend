import { InviteLink } from "../../repositories/interfaces/invite-link.repository.interface.js";

export interface InviteLinkService {
  create: (userId: string, chatId: string) => Promise<InviteLink>;
}
