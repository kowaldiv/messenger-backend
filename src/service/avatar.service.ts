import sharp from "sharp";
import { NotFoundError, ValidationError } from "../errors/index.js";
import { AvatarRepository } from "../repositories/interfaces/avatar.repository.interface.js";
import { AvatarService, uploadAvatarInput } from "./interface.js";
import { StorageService } from "./implementations/storage.service.js";

export function avatarService(
  avatarRepository: AvatarRepository,
  storageService: StorageService,
): AvatarService {
  const validateFile = (file: uploadAvatarInput["file"]) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

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

  const uploadAvatar = async (
    entityType: "user" | "chat",
    entityId: string,
    input: uploadAvatarInput,
  ) => {
    const { file } = input;
    validateFile(file);
    const optimizedBuffer = await optimizeImage(file.buffer);
    const fileName = `${entityId}-${Date}`;
    const folder = `users/${entityId}/avatars`;
    const avatarUrl = await storageService.uploadFile(
      optimizedBuffer,
      fileName,
      folder,
    );
    const avatar = await avatarRepository.addAvatar(
      entityType,
      entityId,
      avatarUrl,
    );
    return avatar;
  };

  const setPrimaryAvatar = async (
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ) => {
    const avatar = await avatarRepository.findAvatar(
      entityType,
      entityId,
      avatarId,
    );
    if (!avatar) throw new NotFoundError("AVATAR_NOT_FOUND");

    await avatarRepository.setPrimaryAvatar(entityType, entityId, avatarId);
  };

  const deleteAvatar = async (
    entityType: "user" | "chat",
    entityId: string,
    avatarId: string,
  ) => {
    const avatar = await avatarRepository.findAvatar(
      entityType,
      entityId,
      avatarId,
    );
    if (!avatar) throw new NotFoundError("AVATAR_NOT_FOUND");

    await avatarRepository.deleteAvatar(entityType, entityId, avatarId);
  };

  const getAvatars = async (entityType: "user" | "chat", entityId: string) => {
    const avatars = await avatarRepository.findAvatars(entityType, entityId);
    return avatars;
  };

  return {
    uploadAvatar,
    setPrimaryAvatar,
    deleteAvatar,
    getAvatars,
  };
}
