import { Avatar } from "./avatar.repository.interface.js";
import { User } from "./user.repository.interface.js";

export interface PublicUser extends User {
  avatars: Avatar[];
}

export interface UserQueryRepository {
  findByIdWithPrimaryAvatar(id: string): Promise<PublicUser | null>;
  findByIdWithAvatars(id: string): Promise<PublicUser | null>;
  findByEmailWithAvatars(email: string): Promise<PublicUser | null>;
  findManyByUsernamePatternWithPrimaryAvatar(
    usernamePattern: string,
  ): Promise<PublicUser[]>;
}