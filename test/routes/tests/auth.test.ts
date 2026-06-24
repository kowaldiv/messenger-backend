import { test } from "node:test";
import * as assert from "node:assert";
import { createTestUser, registerTestUser } from "../../utils/test-helpers.js";

export async function authTest(app: any) {
  await test("Auth", async () => {
    await test("POST /api/auth/register - success", async () => {
      const testUser = createTestUser();

      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: testUser,
      });

      assert.equal(res.statusCode, 201);
      const data = JSON.parse(res.payload);
      assert.ok(data);
      const cookies = res.cookies;
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
    });

    await test("POST /api/auth/login - success", async () => {
      const { testUser } = await registerTestUser(app);

      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      assert.equal(res.statusCode, 200);
      const cookies = res.cookies;
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
    });

    await test("POST /api/auth/forgot-password - success", async () => {
      const { testUser } = await registerTestUser(app);

      const res = await app.inject({
        method: "POST",
        url: "/auth/forgot-password",
        payload: {
          email: testUser.email,
        },
      });

      assert.equal(res.statusCode, 200);
    });

    await test("GET /api/auth/refresh-token - success", async () => {
      const testUser = await registerTestUser(app);

      // Use refresh token to get new access token
      const res = await app.inject({
        method: "GET",
        url: "/auth/refresh-token",
        cookies: {
          refresh_token: testUser.refreshToken,
        },
      });

      assert.equal(res.statusCode, 200);
      const cookies = res.cookies;
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
    });

    await test("GET /api/auth/logout - success", async () => {
      const { accessToken } = await registerTestUser(app);

      const res = await app.inject({
        method: "GET",
        url: "/auth/logout",
        cookies: {
          access_token: accessToken,
        },
      });

      assert.equal(res.statusCode, 200);
    });

    await test("GET /api/auth/sessions - success", async () => {
      const { accessToken } = await registerTestUser(app);

      const res = await app.inject({
        method: "GET",
        url: "/auth/sessions",
        cookies: {
          access_token: accessToken,
        },
      });

      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.payload);
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
    });

    await test("POST /api/auth/revoke-session - success", async () => {
      const { accessToken } = await registerTestUser(app);

      // First get sessions to get a tokenId
      const sessionsRes = await app.inject({
        method: "GET",
        url: "/auth/sessions",
        cookies: {
          access_token: accessToken,
        },
      });

      const sessionsData = JSON.parse(sessionsRes.payload);
      const tokenId = sessionsData[0].id;

      // Revoke the session
      const res = await app.inject({
        method: "POST",
        url: "/auth/revoke-session",
        cookies: {
          access_token: accessToken,
        },
        payload: {
          tokenId: tokenId,
        },
      });

      assert.equal(res.statusCode, 200);
    });
  });
}

// test("POST /api/auth/reset-password - success", async () => {
//   // Register a user
//   const testUser = createTestUser();
//   await app.inject({
//     method: "POST",
//     url: "/auth/register",
//     payload: testUser,
//   });

//   // Request password reset
//   await app.inject({
//     method: "POST",
//     url: "/auth/forgot-password",
//     payload: {
//       email: testUser.email,
//     },
//   });

//   // токен приходит на почту, потом придумаю как этот тест пройти
//   const resetToken = "mock-reset-token";

//   const res = await app.inject({
//     method: "POST",
//     url: "/auth/reset-password",
//     payload: {
//       token: resetToken,
//       newPassword: "newpassword123",
//     },
//   });

//   assert.equal(res.statusCode, 200);

//   // Verify can login with new password
//   const loginRes = await app.inject({
//     method: "POST",
//     url: "/auth/login",
//     payload: {
//       email: testUser.email,
//       password: "newpassword123",
//     },
//   });

//   assert.equal(loginRes.statusCode, 200);
// });
