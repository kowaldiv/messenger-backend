import { PublicInviteLink } from "../../repositories/interfaces/invite-link.repository.interface.js";

export interface InviteLinkService {
  create: (userId: string, chatId: string) => Promise<PublicInviteLink>;
}
