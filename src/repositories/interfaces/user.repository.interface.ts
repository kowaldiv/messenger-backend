import { PublicUser } from "./userQuery.repository.interface.js";

export interface User {
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
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;

  create(data: CreateUserInput): Promise<PublicUser>;

  updateProfile(id: string, data: UpdateUserProfileInput): Promise<User>;
  updatePassword(id: string, newPasswordHash: string): Promise<void>;
  updateLastSeen(id: string): Promise<void>;

  existsById(id: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;

  banUser(id: string): Promise<void>;

  findManyByPattern(pattern: string): Promise<PublicUser[]>
}