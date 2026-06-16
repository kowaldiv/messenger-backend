export interface PublicUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  lastSeen: Date;
  createdAt: Date;
}

export type CreateUserInput = {
  username: string;
  firstName: string;
  lastName?: string;
  email: string;
  passwordHash: string;
};

export type UpdateUserProfileInput = {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  lastSeen?: Date;
};

export interface UserRepository {
  findById(id: string): Promise<PublicUser | null>;
  findByEmail(email: string): Promise<PublicUser | null>;

  create(data: CreateUserInput): Promise<PublicUserWithAvatars>;

  updateProfile(id: string, data: UpdateUserProfileInput): Promise<PublicUser>;
  updatePassword(id: string, newPasswordHash: string): Promise<void>;
  updateLastSeen(id: string): Promise<void>;

  existsById(id: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;

  banUser(id: string): Promise<void>;
}

export type CreateSessionInput = {
  userId: string;
  token: string;
  tokenType: "refresh" | "reset_password";
  fingerprint: string;
  expiresAt: Date;
};

export interface PublicTokenInfo {
  id: string;
  userId: string;
  fingerprint: string;
  createdAt: Date;
}

export interface TokenRepository {
  allSessions(userId: string): Promise<PublicTokenInfo[]>;
  createToken(data: CreateSessionInput): Promise<{
    token: string;
    expiresAt: Date;
  }>;
  isTokenValidByToken(token: string): Promise<PublicTokenInfo | null>;
  isTokenValidById(id: string): Promise<PublicTokenInfo | null>;
  deleteTokenByToken(token: string): Promise<void>;
  deleteTokenById(id: string, userId: string): Promise<void>;
}

export interface Avatar {
  id: string;
  avatarUrl: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface AvatarRepository {
  addAvatar(userId: string, avatarUrl: string): Promise<Avatar>;
  setPrimaryAvatar(userId: string, avatarId: string): Promise<void>;
  deleteAvatar(avatarId: string, userId: string): Promise<void>;
}

export interface PublicUserWithAvatars extends PublicUser {
  avatars: Avatar[];
}

export interface UserQueryRepository {
  findByIdWithPrimaryAvatar(id: string): Promise<PublicUserWithAvatars | null>;
  findByIdWithAvatars(id: string): Promise<PublicUserWithAvatars | null>;
  findByEmailWithAvatars(email: string): Promise<PublicUserWithAvatars | null>;
  findManyByUsernamePatternWithPrimaryAvatar(
    usernamePattern: string,
  ): Promise<PublicUserWithAvatars[]>;
}

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  globalRole: string;
};

export interface AuthRepository {
  findByEmailWithCredentials(email: string): Promise<AuthUser | null>;
}
