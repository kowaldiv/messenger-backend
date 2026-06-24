import { test } from "node:test";
import { chatTest } from "./tests/chat.test.js";
import { build } from "../helper.js";
import { authTest } from "./tests/auth.test.js";
import { avatarTest } from "./tests/avatar.test.js";
import { messageTest } from "./tests/message.test.js";

await test("App", async (t) => {
  const app = await build(t);
  await authTest(app);
  await chatTest(app);
  await avatarTest(app);
  await messageTest(app);
});
