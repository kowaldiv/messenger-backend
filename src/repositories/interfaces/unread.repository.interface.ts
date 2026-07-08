export interface UnreadRepository {
  getUnreadCount(userId: string, chatId: string): Promise<number>;
  getUnreadCounts(
    userId: string,
    chatIds: string[],
  ): Promise<{ chatId: string; unreadCount: number }[]>;
  getUnreadCountsForChat(chatId: string): Promise<
    {
      userId: string;
      unread: string;
    }[]
  >;
  getUnreadCountsForChats(chatIds: string[]): Promise<
    {
      chatId: string;
      participantsUnread: {
        userId: string;
        unread: string;
      }[];
    }[]
  >;
}
