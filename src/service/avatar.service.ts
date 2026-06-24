import sharp from "sharp";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/index.js";
import { AvatarRepository } from "../repositories/interfaces/avatar.repository.interface.js";
import {
  AvatarService,
  uploadAvatarInput,
} from "./interfaces/avatar.service.interface.js";
import { ChatRepository } from "../repositories/interfaces/chat.repository.interface.js";
import { StorageRepository } from "../repositories/implementations/storage.service.js";

export function avatarService(
  avatarRepository: AvatarRepository,
  chatRepository: ChatRepository,
  storageRepository: StorageRepository,
): AvatarService {
  const validateFile = (file: uploadAvatarInput["file"]) => {
    // разрешенные типы аватаров
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    // проверки файла
    if (!file) {
      throw new ValidationError("FILE_IS_REQUIRED");
    }
    if (!allowedTypes.includes(file.minetype)) {
      throw new ValidationError("INVALID_FILE_TYPE");
    }
    if (file.size > maxSize) {
      throw new ValidationError("FILE_TOO_LARGE");
    }
  };

  const optimizeImage = async (buffer: Buffer): Promise<Buffer> => {
    // оптимизируем, делаем 500 на 500 пикселей и квадратную
    return await sharp(buffer)
      .resize(500, 500, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toBuffer();
  };

  const uploadUserAvatar = async (
    entityId: string,
    input: uploadAvatarInput,
  ) => {
    // получаем файл, проверяем, оптимизируем
    const { file } = input;
    validateFile(file);
    // отправляем в сервис чтоб он сохранился
    const optimizedBuffer = await optimizeImage(file.buffer);
    const fileName = `${entityId}-${new Date()}`;
    const folder = `users/${entityId}/avatars`;
    const avatarUrl = await storageRepository.uploadFile(
      optimizedBuffer,
      fileName,
      folder,
    );
    // создаем пользователя в БД
    const avatar = await avatarRepository.addAvatar(
      "user",
      entityId,
      avatarUrl,
    );
    return avatar;
  };

  const setPrimaryUserAvatar = async (entityId: string, avatarId: string) => {
    // проверяем существует ли этот аватар у пользователя
    const avatar = await avatarRepository.findAvatar(
      "user",
      entityId,
      avatarId,
    );
    if (!avatar) throw new NotFoundError("AVATAR_NOT_FOUND");
    // ставим у пользователя эту аватарку главной
    await avatarRepository.setPrimaryAvatar("user", entityId, avatarId);
  };

  const deleteUserAvatar = async (entityId: string, avatarId: string) => {
    // проверяем существует ли этот аватар у пользователя
    const avatar = await avatarRepository.findAvatar(
      "user",
      entityId,
      avatarId,
    );
    if (!avatar) throw new NotFoundError("AVATAR_NOT_FOUND");
    // удаляем у пользователя эту аватарку
    await avatarRepository.deleteAvatar("user", entityId, avatarId);
  };

  const uploadChatAvatar = async (
    userId: string,
    chatId: string,
    input: uploadAvatarInput,
  ) => {
    // проверяем что пользователь админ в этом чате чтоб менять аватарки
    const isUserChatOwner = chatRepository.ensureUserIsChatOwner(
      userId,
      chatId,
    );
    if (!isUserChatOwner) {
      throw new ForbiddenError("ONLY_OWNER_CAN_MANAGE_AVATAR");
    }
    // получаем файл, проверяем, оптимизируем
    const { file } = input;
    validateFile(file);
    const optimizedBuffer = await optimizeImage(file.buffer);
    // отправляем в сервис чтоб он сохранился
    const fileName = `${chatId}-${new Date()}`;
    const folder = `chats/${chatId}/avatars`;
    const avatarUrl = await storageRepository.uploadFile(
      optimizedBuffer,
      fileName,
      folder,
    );
    // сохраняем в БД
    const avatar = await avatarRepository.addAvatar("chat", chatId, avatarUrl);
    return avatar;
  };

  const setPrimaryChatAvatar = async (
    userId: string,
    chatId: string,
    avatarId: string,
  ) => {
    // проверяем что пользователь админ в этом чате чтоб менять аватарки
    const isUserChatOwner = chatRepository.ensureUserIsChatOwner(
      userId,
      chatId,
    );
    if (!isUserChatOwner) {
      throw new ForbiddenError("ONLY_OWNER_CAN_MANAGE_AVATAR");
    }
    // проверяем существует ли этот аватар у чата
    const avatar = await avatarRepository.findAvatar("chat", chatId, avatarId);
    if (!avatar) throw new NotFoundError("AVATAR_NOT_FOUND");
    // ставим у чата эту аватарку главной
    await avatarRepository.setPrimaryAvatar("chat", chatId, avatarId);
  };

  const deleteChatAvatar = async (
    userId: string,
    chatId: string,
    avatarId: string,
  ) => {
    // проверяем что пользователь админ в этом чате чтоб менять аватарки
    const isUserChatOwner = chatRepository.ensureUserIsChatOwner(
      userId,
      chatId,
    );
    if (!isUserChatOwner) {
      throw new ForbiddenError("ONLY_OWNER_CAN_MANAGE_AVATAR");
    }
    // проверяем существует ли этот аватар у чата
    const avatar = await avatarRepository.findAvatar("chat", chatId, avatarId);
    if (!avatar) throw new NotFoundError("AVATAR_NOT_FOUND");
    // удаляем у чата эту аватарку
    await avatarRepository.deleteAvatar("chat", chatId, avatarId);
  };

  const getAvatars = async (entityType: "user" | "chat", entityId: string) => {
    // получаем все аватарки у сущности
    const avatars = await avatarRepository.findAvatars(entityType, entityId);
    return avatars;
  };

  return {
    uploadUserAvatar,
    setPrimaryUserAvatar,
    deleteUserAvatar,
    uploadChatAvatar,
    setPrimaryChatAvatar,
    deleteChatAvatar,
    getAvatars,
  };
}
