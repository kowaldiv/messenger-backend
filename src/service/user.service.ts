import { UserRepository } from "../repositories/interfaces/user.repository.interface.js";

export function userService(userRepository: UserRepository) {

  // ------------ получение информации ----------------



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
    const updatedUserInfo = await userRepository.updateProfile(userId, data);
    return updatedUserInfo;
  };

  const updateLastSeen = async (userId: string) => {
    await userRepository.updateLastSeen(userId);
  };

  return {
    updateUserProfile,
    updateLastSeen,
  };
}
