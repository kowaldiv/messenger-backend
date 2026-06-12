export interface Avatar {
  id: string;
  avatarUrl: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  lastSeen: Date;
  createdAt: Date;
}

export interface PublicUserWithAvatars extends PublicUser {
  avatars: Avatar[];
}

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  globalRole: string;
};

export type CreateUserInput = {
  username: string;
  firstName: string;
  lastName?: string;
  email: string;
  passwordHash: string;
};

export type UpdateUserInput = {
  username?: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  bio?: string;
  lastSeen?: Date;
};

export interface UserRepository {
  findById(id: string): Promise<PublicUser | null>;
  findByIdWithPrimaryAvatar(id: string): Promise<PublicUserWithAvatars | null>;
  findByIdWithAvatars(id: string): Promise<PublicUserWithAvatars | null>;
  findManyByUsernameWithPrimaryAvatar(
    usernamePattern: string,
  ): Promise<PublicUserWithAvatars[]>;
  create(data: CreateUserInput): Promise<PublicUser>;
  update(id: string, data: CreateUserInput): Promise<PublicUser>;
  updateLastSeen(id: string): Promise<void>;
  banUser(id: string): Promise<void>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  addAvatar(userId: string, avatarUrl: string): Promise<Avatar>;
  setPrimaryAvatar(userId: string, avatarId: string): Promise<void>;
  deleteAvatar(avatarId: string, userId: string): Promise<void>;
}
