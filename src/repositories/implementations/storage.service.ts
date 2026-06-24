export interface StorageRepository {
  uploadFile(buffer: Buffer, fileName: string, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export function s3StorageRepository(): StorageRepository {
  const uploadFile = async (
    buffer: Buffer,
    fileName: string,
    folder: string,
  ) => {
    return `https://example/s3/storage/${folder}/${fileName}`;
  };

  const deleteFile = async (fileUrl: string) => {};

  return {
    uploadFile,
    deleteFile,
  };
}
