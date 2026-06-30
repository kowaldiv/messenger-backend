import { registerTestUser } from "./test-helpers.js";
import { io as ioc } from "socket.io-client";

export async function createAndConnectUser(app: any) {
  // 1. Регистрируем пользователя
  const { accessToken, user } = await registerTestUser(app);

  // 2. Создаем сокет-клиент
  const client = ioc("http://localhost:3000", {
    transports: ["websocket"],
    forceNew: true,
    extraHeaders: {
      Cookie: `access_token=${accessToken}`,
    },
  });

  // 3. Ждем подключения
  await new Promise((resolve) => {
    client.on("connect", () => resolve(true));
  });

  // 4. Возвращаем объект
  return { accessToken, user, client };
}

// Вспомогательная функция для создания тестового чата
export async function createTestChat(
  client: any,
  options?: {
    type?: "group" | "channel";
    title?: string;
  },
): Promise<any> {
  const { type = "group", title = "test Chat" } = options || {};

  // Создаем промис для ожидания ответа
  const createdChat = new Promise((resolve) => {
    client.once("createdChat", resolve);
  });

  // Отправляем запрос на создание чата
  client.emit(
    "createChat",
    JSON.stringify({
      type: type,
      title: title,
    }),
  );

  // Ждем ответа от сервера
  const chat = await createdChat;

  return chat;
}
