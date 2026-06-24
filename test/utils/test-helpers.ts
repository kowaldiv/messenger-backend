import { Readable } from "node:stream";

interface User {
  email: string;
  password: string;
  username: string;
  firstname: string;
  lastName: string;
}

export interface PublicUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  lastSeen: Date;
  createdAt: Date;
}

export interface Avatar {
  id: string;
  avatarUrl: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface PublicUserWithAvatars extends PublicUser {
  avatars: Avatar[];
}

export function createTestUser(userData?: Partial<User>) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const defaultUser = {
    email: `test-${timestamp}-${random}@example.com`,
    password: "test123456",
    username: `testuser-${timestamp}-${random}`,
    firstName: "testUser",
    lastName: "test",
  };

  const testUser = { ...defaultUser, ...userData };

  return testUser;
}

export async function registerTestUser(app: any): Promise<{
  testUser: User;
  user: PublicUserWithAvatars;
  accessToken: string;
  refreshToken: string;
}> {
  const testUser = createTestUser() as User;
  const res = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: testUser,
  });
  return {
    testUser: testUser,
    user: JSON.parse(res.payload),
    accessToken: res.cookies?.find((c: any) => c.name === "access_token")
      ?.value,
    refreshToken: res.cookies?.find((c: any) => c.name === "refresh_token")
      ?.value,
  };
}

// Вспомогательная функция для создания тестового чата
export async function createTestChat(app: any, accessToken: string) {
  const chatRes = await app.inject({
    method: "POST",
    url: "/chat/create",
    cookies: {
      access_token: accessToken,
    },
    payload: {
      type: "group",
      title: `Test Chat ${Date.now()}`,
    },
  });

  if (chatRes.statusCode !== 201) {
    console.error("Chat creation failed:", chatRes.payload);
    throw new Error(`Failed to create test chat: ${chatRes.payload}`);
  }

  const chatData = JSON.parse(chatRes.payload);
  const chatId = chatData.id;

  if (!chatId) {
    console.error("Chat response:", chatData);
    throw new Error("Failed to get chat ID from response");
  }

  return chatId;
}

export function createTestFile() {
  // Простой PNG 1x1 пиксель
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  return {
    filename: "test-avatar.png",
    data: pngBuffer,
    contentType: "image/png",
  };
}

// Создаем тестовый файл в виде Buffer
export function createTestImageBuffer() {
  // Простой PNG 1x1 пиксель
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  return pngBuffer;
}

// Создаем Readable Stream из Buffer
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
