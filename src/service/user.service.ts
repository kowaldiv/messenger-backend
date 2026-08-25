import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/index.js";
import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";
import { UserQueryRepository } from "../repositories/interfaces/userQuery.repository.interface.js";
import { UserService } from "./interfaces/user.service.interface.js";

export function userService(
  userRepository: UserRepository,
  userQueryReposirory: UserQueryRepository,
): UserService {
  // ------------ получение информации ----------------

  const getUserInfo = async (userId: string) => {
    const userInfo = await userQueryReposirory.findByIdWithAvatars(userId);
    if (!userInfo) throw new NotFoundError("Пользователь не найден");

    return userInfo;
  };

  // -------------- обновление информации ----------------

  const updateUserProfile = async ({
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
  }) => {
    if (data.username) {
      const isUserExists = await userRepository.existsByUsername(data.username);
      if (isUserExists)
        throw new ConflictError(
          "Пользователь с таким username уже существует!",
        );
    }
    await userRepository.updateProfile(userId, data);
  };

  const updateLastSeen = async (userId: string | undefined) => {
    if (!userId) {
      throw new UnauthorizedError();
    }

    return await userRepository.updateLastSeen(userId);
  };

  return {
    getUserInfo,
    updateUserProfile,
    updateLastSeen,
  };
}
