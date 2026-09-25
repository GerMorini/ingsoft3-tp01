// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { login } from "./api";
import type { LoginInput } from "./types";

const credentials: LoginInput = {
  username: "ada_01",
  password: "Segura!@123",
};

describe("login", () => {
  it("uses the injected HTTP client exactly once", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: "signed-token",
          tokenType: "Bearer",
          expiresIn: 1800,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await login(credentials, fetcher);

    expect(result).toEqual({
      accessToken: "signed-token",
      tokenType: "Bearer",
      expiresIn: 1800,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  });

  it("turns a rejected response into an ApiError", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "invalid_credentials",
            message: "Usuario o contraseña inválidos.",
          },
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    );

    const request = login(credentials, fetcher);

    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      body: {
        code: "invalid_credentials",
        message: "Usuario o contraseña inválidos.",
      },
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
