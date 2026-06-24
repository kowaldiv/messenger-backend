export interface InviteLink {
  id: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  chatId: string;
}

export interface InviteLinkRepository {
  create: (
    token: string,
    expiresAt: Date,
    chatId: string,
  ) => Promise<InviteLink>;
}
