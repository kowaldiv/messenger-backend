import { Avatar } from "./avatar.repository.interface.js";
import { PublicUser } from "./user.repository.interface.js";

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