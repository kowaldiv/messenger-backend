import { PublicUser } from "../../repositories/interfaces/userQuery.repository.interface.js";

export interface UserService {
  getUserInfo(userId: string): Promise<PublicUser>;
  updateUserProfile({
    data,
    userId,
  }: {
    data: {
      username?: string;
      firstName?: string;
      lastName?: string;
      bio?: string;
    };
    userId: string;
  }): Promise<void>;
  updateLastSeen(userId: string): Promise<void>;
}
