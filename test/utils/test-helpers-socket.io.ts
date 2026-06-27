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
