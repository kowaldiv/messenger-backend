import { test } from "node:test";
import * as assert from "node:assert";
import { createTestUser } from "../../utils/test-helpers.js";

export async function chatTest(app: any) {
  await test("Chats", async () => {
    await test("POST /chat/create - success", async () => {
      const testUser = createTestUser();

      const registerRes = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: testUser,
      });

      assert.equal(registerRes.statusCode, 201);
      const registerData = JSON.parse(registerRes.payload);
      assert.ok(registerData);
      const cookies = registerRes.cookies;
      const accessTokenCookie = cookies.find(
        (c: any) => c.name === "access_token",
      );
      const accessToken = accessTokenCookie?.value;
      assert.ok(accessToken);
      const refreshTokenCookie = cookies.find(
        (c: any) => c.name === "refresh_token",
      );
      const refreshToken = refreshTokenCookie?.value;
      assert.ok(refreshToken);

      const res = await app.inject({
        method: "POST",
        url: "/chat/create",
        cookies: {
          access_token: accessToken,
        },
        payload: {
          type: "group",
          title: "test",
        },
      });

      assert.equal(res.statusCode, 201);
      const data = JSON.parse(res.payload);
      assert.ok(data);
    });
  });
}
