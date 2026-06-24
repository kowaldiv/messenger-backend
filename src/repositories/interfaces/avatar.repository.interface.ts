export interface Avatar {
  id: string;
  avatarUrl: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface AvatarRepository {
  findAvatar(
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ): Promise<Avatar | null>;
  findAvatars(entityType: "user" | "chat", entityId: string): Promise<Avatar[]>;
  addAvatar(
    entityType: "user" | "chat",
    entityId: string,
    avatarUrl: string,
  ): Promise<Avatar>;
  setPrimaryAvatar(
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ): Promise<void>;
  deleteAvatar(
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ): Promise<void>;
}
