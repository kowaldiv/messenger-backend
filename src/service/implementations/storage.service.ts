export interface StorageService {
  uploadFile(buffer: Buffer, fileName: string, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

export function s3StorageService(): StorageService {
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
