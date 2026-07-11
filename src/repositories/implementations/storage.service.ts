import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { extname } from "path";
import { config } from "../../config/index.js";

export interface StorageRepository {
  uploadFile(buffer: Buffer, fileName: string, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export function s3StorageRepository(): StorageRepository {
  const s3Client = new S3Client({
    region: config.YANDEX_STORAGE_REGION,
    endpoint: config.YANDEX_STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: config.YANDEX_ACCESS_KEY!,
      secretAccessKey: config.YANDEX_SECRET_KEY!,
    },
    forcePathStyle: true, // обязательно для Yandex Object Storage
  });

  const bucket = config.YANDEX_BUCKET_NAME;
  const endpoint = config.YANDEX_STORAGE_ENDPOINT;

  if (!bucket) {
    throw new Error("❌ YANDEX_STORAGE_BUCKET is not configured in .env");
  }

  // Определяем Content-Type по расширению файла
  const getContentType = (fileName: string): string => {
    const ext = extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    return mimeTypes[ext] || "application/octet-stream";
  };

  const uploadFile = async (
    buffer: Buffer,
    fileName: string,
    folder: string,
  ): Promise<string> => {
    try {
      // Генерируем уникальное имя, чтобы избежать коллизий
      const uniqueName = `${randomUUID()}${extname(fileName)}`;
      const key = `${folder}/${uniqueName}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: getContentType(fileName),
          CacheControl: "public, max-age=31536000", // кэширование на 1 год
        }),
      );

      // Формируем публичный URL
      // Формат: https://storage.yandexcloud.net/{bucket}/{key}
      const publicUrl = `${endpoint}/${bucket}/${key}`;
      return publicUrl;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error("STORAGE_UPLOAD_FAILED");
    }
  };

  const deleteFile = async (fileUrl: string): Promise<void> => {
    try {
      // Извлекаем ключ из URL
      // URL: https://storage.yandexcloud.net/bucket/folder/file.jpg
      // Key: folder/file.jpg
      const urlParts = fileUrl.split("/");
      const key = urlParts.slice(4).join("/"); // пропускаем protocol, host, bucket

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error("STORAGE_DELETE_FAILED");
    }
  };

  return {
    uploadFile,
    deleteFile,
  };
}
