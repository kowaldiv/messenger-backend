import { PublicUserWithAvatars } from "./userQuery.repository.interface.js";

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